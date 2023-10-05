import { hydraulicPressLocation, world } from "./game";

export class Renderer {

	static instance: Renderer;

	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D | null = null;
	private pressImg = new Image();

	constructor() {
		this.pressImg.src = "hydraulic-press.svg";
		this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
	}

	render() {
		if (this.ctx === null || this.canvas.width !== this.canvas.offsetWidth || this.canvas.height !== this.canvas.offsetHeight) {
			this.canvas.width = this.canvas.offsetWidth;
			this.canvas.height = this.canvas.offsetHeight;
			this.ctx = this.canvas.getContext("2d");
			if (!this.ctx)
				throw 0;
		}

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
		this.ctx.scale(5, -5);
		this.ctx.translate(0, -6*12);

		this.ctx.fillStyle = "#8882";
		this.ctx.beginPath();
		this.ctx.roundRect(-30, 0, 6*10, 6*24, 2);
		this.ctx.fill();

		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.roundRect(-30, 0, 6*10, 6*24, 2);
		this.ctx.clip();

		for (const body of world.bodies) {
			this.ctx.fillStyle = body.userdata.color;
			this.ctx.lineJoin = "round";
			this.ctx.beginPath();
			let at = body.nodes[0];
			const start = at;
			this.ctx.moveTo(at.position.x, at.position.y);
			let counter = 0;
			do {
				at = at.userdata;
				this.ctx.lineTo(at.position.x, at.position.y);
			}
			while (start !== at && counter++ < 50);
			this.ctx.closePath();
			this.ctx.lineWidth = 4;
			this.ctx.strokeStyle = body.userdata.strokeColor;
			this.ctx.stroke();
			this.ctx.lineWidth = 3;
			this.ctx.strokeStyle = body.userdata.color;
			this.ctx.stroke();
			this.ctx.fill();
		}

		this.ctx.lineWidth = 0.5;

		this.ctx.strokeStyle = "#f00";
		this.ctx.setLineDash([1, 1]);
		this.ctx.lineDashOffset = 0.5;
		this.ctx.lineCap = "round";
		this.ctx.beginPath();
		this.ctx.moveTo(-30, 6*20);
		this.ctx.lineTo(30, 6*20);
		this.ctx.stroke();

		this.ctx.scale(1, -1);
		this.ctx.drawImage(this.pressImg, -30, -hydraulicPressLocation - 21, 60, 21);
		this.ctx.restore();

		this.ctx.lineWidth = 0.5;
		this.ctx.strokeStyle = "#000";
		this.ctx.setLineDash([]);
		this.ctx.beginPath();
		this.ctx.roundRect(-30, 0, 6*10, 6*24, 2);
		this.ctx.stroke();

		this.ctx.resetTransform();
	}

}
