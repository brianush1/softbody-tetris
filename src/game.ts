import { PhysicsWorld, PointMass, SoftBody, Spring } from "./physics";

const DI = [ -1, -1, -1,  0,  0,  1,  1,  1 ];
const DJ = [ -1,  0,  1, -1,  1, -1,  0,  1 ];

export let world = new PhysicsWorld();
function createTromino(x: number, y: number, color: string, strokeColor: string, data: boolean[][]) {
	const h = data.length;
	const w = data[0].length;
	const midX = 3 * w / 2 | 0;
	const midY = 3 * h / 2 | 0;
	const group = Symbol();
	const newData: boolean[][] = Array(3 * h).fill(undefined).map(() => Array(3 * w).fill(false));
	for (let i = 0; i < 3 * h; ++i)
		for (let j = 0; j < 3 * w; ++j)
			if (data[i / 3 | 0][j / 3 | 0])
				newData[i][j] = true;
	const body = new SoftBody();
	const points: PointMass[][] = Array(3 * h).fill(undefined).map(() => Array(3 * w));
	for (let i = 0; i < 3 * h; ++i) {
		for (let j = 0; j < 3 * w; ++j) {
			if (!newData[i][j])
				continue;
			let canSeeSpace = false;
			for (let k = 0; k < DI.length; ++k) {
				const ni = i + DI[k];
				const nj = j + DJ[k];
				if (!(ni >= 0 && nj >= 0 && ni < 3 * h && nj < 3 * w)
					|| newData[ni][nj] === false
				) {
					canSeeSpace = true;
				}
			}
			if (canSeeSpace) {
				const node = new PointMass(body);
				node.position.y = (i - midY) * 2 + y;
				node.position.x = (j - midX) * 2 + x;
				node.radius = 2;
				node.collisionGroup = group;
				points[i][j] = node;
			}
		}
	}

	{
		let di: number = 0, dj: number = -1;
		let i: number = 3 * h - 1, j: number;
		for (j = 0; j < 3 * w; ++j)
			if (points[i][j])
				break;
		const si = i, sj = j;

		function validate(ni: number, nj: number) {
			return ni >= 0 && nj >= 0 && ni < 3 * h && nj < 3 * w && points[ni][nj];
		}

		do {
			const curr = points[i][j];
			if (!validate(i + di, j + dj)) {
				if (validate(i + dj, j - di)) {
					const temp = dj;
					dj = -di;
					di = temp;
				}
				else if (validate(i - dj, j + di)) {
					const temp = dj;
					dj = di;
					di = -temp;
				}
				else
					throw 0;
			}
			i += di;
			j += dj;
			curr.userdata = points[i][j];
		}
		while (i !== si || j !== sj);
	}

	for (const row of points)
		for (const pt of row)
			if (pt !== undefined)
				body.nodes.push(pt);
	body.userdata = {
		color,
		strokeColor,
	};
	world.addBody(body);

	function connect(obj: PointMass, i: number, j: number) {
		if (i >= 0 && i < points.length && points[i][j] !== undefined) {
			const spr = new Spring(obj, points[i][j]);
			spr.autoLength();
			spr.strength = 1000;
			spr.damping = 100;
			world.springs.add(spr);
		}
	}

	for (let i = 0; i < 3 * h; ++i) {
		for (let j = 0; j < 3 * w; ++j) {
			const a = points[i][j];
			if (!a)
				continue;
			connect(a, i + 1, j);
			connect(a, i, j + 1);
			connect(a, i + 1, j + 1);
			connect(a, i + 1, j - 1);
		}
	}

	return body;
}

const trominoes: {
	color: string;
	strokeColor: string;
	data: boolean[][];
}[] = [
	{
		color: "#0cc",
		strokeColor: "#0aa",
		data: [[true, true, true, true]],
	},
	{
		color: "#04f",
		strokeColor: "#03c",
		data: [
			[true, false, false, false],
			[true, true, true, true],
		],
	},
	{
		color: "#f70",
		strokeColor: "#c50",
		data: [
			[false, false, false, true],
			[true, true, true, true],
		],
	},
	{
		color: "#fc0",
		strokeColor: "#ca0",
		data: [
			[true, true],
			[true, true],
		],
	},
	{
		color: "#0c0",
		strokeColor: "#0a0",
		data: [
			[false, true, true],
			[true, true, false],
		],
	},
	{
		color: "#c0c",
		strokeColor: "#a0a",
		data: [
			[false, true, false],
			[true, true, true],
		],
	},
	{
		color: "#f00",
		strokeColor: "#c00",
		data: [
			[true, true, false],
			[false, true, true],
		],
	},
];

export let hydraulicPressLocation = 6*24;
world.topLine = hydraulicPressLocation;

let currentTrominoBody: SoftBody | undefined;
let gameOver: boolean = false;
let displayingBoard: boolean = false;

const pressedKeys = new Set<string>();
document.addEventListener("keydown", e => { pressedKeys.add(e.code); });
document.addEventListener("keyup", e => { pressedKeys.delete(e.code); });

const gameOverHtml = document.getElementById("game-over")!;
const restartButton = document.getElementById("restart")!;
const showBoardButton = document.getElementById("show-board") as HTMLButtonElement;

restartButton.addEventListener("click", () => {
	gameOverHtml.style.display = "none";
	gameAtLose = undefined;
	displayingBoard = gameOver = false;
	world.topLine = hydraulicPressLocation = 6*24;
	world.softBodyStructure = true;
	for (const body of world.bodies)
		world.removeBody(body);
	for (const spring of world.springs)
		world.springs.delete(spring);
	spawnTromino();
});

let gameAtLose: PhysicsWorld | undefined;
showBoardButton.addEventListener("click", () => {
	showBoardButton.disabled = true;
	if (gameAtLose) {
		hydraulicPressLocation = 6*24;
		displayingBoard = true;
		world = gameAtLose;
		gameAtLose = undefined;
	}
});

let lastTromino: number | undefined;
function spawnTromino() {
	if (gameOver)
		return undefined;

	let index: number;
	do {
		index = Math.random() * trominoes.length | 0;
	}
	while (index === lastTromino);

	lastTromino = index;
	const tromino = trominoes[index];
	currentTrominoBody = createTromino(0, 22 * 6, tromino.color, tromino.strokeColor, tromino.data);
	currentTrominoBody.collisionCallback = obj => {
		if (obj === "bottom" || obj instanceof SoftBody) {
			if (currentTrominoBody!.computeCenterOfMass().y >= 22 * 6) {
				gameAtLose = world.clone();
				gameOver = true;
				gameOverHtml.style.display = "flex";
				showBoardButton.disabled = false;
			}
			currentTrominoBody!.collisionCallback = undefined;
			currentTrominoBody = undefined;
			setTimeout(spawnTromino, 500);
		}
	};
	return currentTrominoBody;
}

spawnTromino();

const GAME_TIME_STEP = 1 / 60;
function fixedStep() {
	if (hydraulicPressLocation > 0 && gameOver && !displayingBoard) {
		hydraulicPressLocation -= 0.5;
		world.topLine = hydraulicPressLocation;
		if (hydraulicPressLocation < 30)
			world.softBodyStructure = false;
	}

	if (currentTrominoBody) {
		if (pressedKeys.has("ArrowLeft") || pressedKeys.has("KeyA")) {
			const velocity = currentTrominoBody.computeVelocity();
			if (velocity.x > -30)
				currentTrominoBody.applyImpulse(-3, 0);
		}
		if (pressedKeys.has("ArrowRight") || pressedKeys.has("KeyD")) {
			const velocity = currentTrominoBody.computeVelocity();
			if (velocity.x < 30)
				currentTrominoBody.applyImpulse(3, 0);
		}
		if (pressedKeys.has("ArrowDown") || pressedKeys.has("KeyS")) {
			currentTrominoBody.applyImpulse(0, -3);
		}
		if (pressedKeys.has("Space")) {
			currentTrominoBody.applyImpulse(0, -100);
		}
		if (pressedKeys.has("KeyQ")) {
			const angularVelocity = currentTrominoBody.computeAngularVelocity();
			if (angularVelocity < 5)
				currentTrominoBody.applyAngularImpulse(0.5);
		}
		if (pressedKeys.has("KeyE")) {
			const angularVelocity = currentTrominoBody.computeAngularVelocity();
			if (angularVelocity > -5)
				currentTrominoBody.applyAngularImpulse(-0.5);
		}
	}
}

let lag = 0;
export function gameTick(dt: number) {
	lag += dt;
	const numTicks = Math.min(lag / GAME_TIME_STEP, 1 / GAME_TIME_STEP) | 0;
	lag %= GAME_TIME_STEP;
	for (let i = 0; i < numTicks; ++i)
		fixedStep();
}
