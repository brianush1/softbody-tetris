// References:
// https://lisyarus.github.io/blog/physics/2023/05/10/soft-body-physics.html
// https://ericleong.me/research/circle-circle/

const PHYSICS_TIME_STEP = 1 / 120;

export class Vec2 {
	x: number; y: number;
	constructor(x: number, y?: number) { this.x = x; this.y = y ?? x; }
	addFactor(value: Vec2, factor: number) { this.x += value.x * factor; this.y += value.y * factor; return this; }
	lerp(value: Vec2, alpha: number) { this.x += (value.x - this.x) * alpha; this.y += (value.y - this.y) * alpha; return this; }
	add(value: Vec2 | number) { if (typeof value === "number") { this.x += value; this.y += value; } else { this.x += value.x; this.y += value.y; } return this; }
	sub(value: Vec2 | number) { if (typeof value === "number") { this.x -= value; this.y -= value; } else { this.x -= value.x; this.y -= value.y; } return this; }
	mul(value: Vec2 | number) { if (typeof value === "number") { this.x *= value; this.y *= value; } else { this.x *= value.x; this.y *= value.y; } return this; }
	div(value: Vec2 | number) { if (typeof value === "number") { this.x /= value; this.y /= value; } else { this.x /= value.x; this.y /= value.y; } return this; }
	set(value: Vec2 | number) { if (typeof value === "number") { this.x  = value; this.y  = value; } else { this.x  = value.x; this.y  = value.y; } return this; }
	distanceTo(other: Vec2) { const dx = this.x - other.x; const dy = this.y - other.y; return Math.sqrt(dx * dx + dy * dy); }
	dot(other: Vec2) { return this.x * other.x + this.y * other.y; }
	cross(other: Vec2) { return this.x * other.y - this.y * other.x; }
	length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
	normalize() { const len = this.length(); return Math.abs(len) < 1e-12 ? this : this.div(len); }
	clone() { return new Vec2(0).set(this); }
	rot90() { const x = this.x, y = this.y; this.x = -y; this.y = x; return this; }
	rotate(angle: number) {
		const x = this.x, y = this.y;
		this.x = x * Math.cos(angle) - y * Math.sin(angle);
		this.y = x * Math.sin(angle) + y * Math.cos(angle);
		return this;
	}
}

type WorldBoundary = "left" | "right" | "bottom" | "top";

interface Collision {
	obj0: PointMass | WorldBoundary;
	obj1: PointMass;
	normal: Vec2;
	depth: number;
}

function encodePosition(x: number, y: number) { return (x + 33_554_432) * 67_108_864 + (y + 33_554_432); }
function getX(pos: number) { return (pos / 67_108_864 | 0) - 33_554_432; }
function getY(pos: number) { return pos % 67_108_864 - 33_554_432; }

export class PhysicsWorld {

	springs = new Set<Spring>();
	objects = new Set<PointMass>();
	bodies = new Set<SoftBody>();
	readonly gravity = new Vec2(0, -50);
	topLine = Infinity;
	softBodyStructure = true;

	clone() {
		const result = new PhysicsWorld();
		const objectMap = new Map<PointMass, PointMass>();
		for (const obj of this.objects) {
			const clone = obj.clone();
			objectMap.set(obj, clone);
			result.objects.add(clone);
		}
		for (const clone of result.objects) {
			if (objectMap.has(clone.userdata))
				clone.userdata = objectMap.get(clone.userdata);
		}
		for (const spring of this.springs) {
			const obj0 = objectMap.get(spring.obj0);
			const obj1 = objectMap.get(spring.obj1);
			if (obj0 === undefined || obj1 === undefined) throw {
				objectMap,
				spring,
			};
			const clone = new Spring(obj0, obj1);
			clone.length = spring.length;
			clone.strength = spring.strength;
			clone.damping = spring.damping;
			result.springs.add(clone);
		}
		for (const body of this.bodies) {
			const clone = new SoftBody();
			for (const node of body.nodes) {
				const cloneNode = objectMap.get(node);
				if (cloneNode === undefined) throw {
					objectMap,
					cloneNode,
				};
				clone.nodes.push(cloneNode);
			}
			for (const pos of body.idealPositions)
				clone.idealPositions.push(pos.clone());
			if (objectMap.has(clone.userdata))
				clone.userdata = objectMap.get(body.userdata);
			else
				clone.userdata = body.userdata;
			result.bodies.add(clone);
		}
		result.gravity.set(this.gravity);
		result.topLine = this.topLine;
		result.softBodyStructure = this.softBodyStructure;
		return result;
	}

	addBody(body: SoftBody) {
		this.bodies.add(body);
		const centerOfMass = body.computeCenterOfMass();
		for (const node of body.nodes) {
			body.idealPositions.push(node.position.clone().sub(centerOfMass));
			this.objects.add(node);
		}
	}

	removeBody(body: SoftBody) {
		this.bodies.delete(body);
		for (const node of body.nodes)
			this.objects.delete(node);
	}

	private applyGravity(dt: number) {
		for (const obj of this.objects)
			if (obj.mass !== 0)
				obj.velocity.addFactor(this.gravity, dt);
	}

	private *findWorldCollisions(obj: PointMass): Generator<Collision, void> {
		if (obj.position.y - obj.radius < 0) {
			yield {
				obj0: "bottom", obj1: obj,
				normal: new Vec2(0, 1),
				depth: -(obj.position.y - obj.radius) - 0,
			};
		}
		if (obj.position.x - obj.radius < -30) {
			yield {
				obj0: "left", obj1: obj,
				normal: new Vec2(1, 0),
				depth: -(obj.position.x - obj.radius) - 30,
			};
		}
		if (obj.position.x + obj.radius > 30) {
			yield {
				obj0: "right", obj1: obj,
				normal: new Vec2(-1, 0),
				depth: (obj.position.x + obj.radius) - 30,
			};
		}
		if (obj.position.y + obj.radius > this.topLine) {
			yield {
				obj0: "top", obj1: obj,
				normal: new Vec2(0, -1),
				depth: (obj.position.y + obj.radius) - this.topLine,
			};
		}
	}

	private *findCollisions(): Generator<Collision, void> {
		const CELL_SIZE = 4;
		const partition = new Map<number, PointMass[]>();
		for (const obj of this.objects) {
			const xLo = Math.floor((obj.position.x - obj.radius) / CELL_SIZE);
			const yLo = Math.floor((obj.position.y - obj.radius) / CELL_SIZE);
			const xHi = Math.ceil((obj.position.x + obj.radius) / CELL_SIZE);
			const yHi = Math.ceil((obj.position.y + obj.radius) / CELL_SIZE);
			for (let i = xLo; i < xHi; ++i) {
				for (let j = yLo; j < yHi; ++j) {
					const enc = encodePosition(i, j);
					let arr: PointMass[] | undefined = partition.get(enc);
					if (!arr) {
						arr = [];
						partition.set(enc, arr);
					}
					if (arr.length < 30)
						arr.push(obj);
				}
			}
		}
		for (const cell of partition.values()) {
			for (let i = 0; i < cell.length; ++i) {
				const obj0 = cell[i];
				yield* this.findWorldCollisions(obj0);

				for (let j = i + 1; j < cell.length; ++j) {
					const obj1 = cell[j];
					if (obj0.collisionGroup === obj1.collisionGroup && obj0.collisionGroup !== undefined)
						continue;

					if (obj0.position.distanceTo(obj1.position) < obj0.radius + obj1.radius) {
						const normal = obj1.position.clone().sub(obj0.position);
						if (normal.length() === 0) {
							normal.x = 1;
							normal.y = 0;
						}
						const distance = normal.length();
						yield {
							obj0, obj1,
							normal: normal.normalize(),
							depth: obj0.radius + obj1.radius - distance,
						};
					}
				}
			}
		}
	}

	private applyCollisions(dt: number) {
		for (const collision of this.findCollisions()) {
			if ((typeof collision.obj0 === "string" || collision.obj0.mass === 0) && collision.obj1.mass === 0)
				continue;

			if (collision.obj1.mass === 0) {
				const temp = collision.obj0;
				collision.obj0 = collision.obj1;
				collision.obj1 = temp as any;
				collision.normal.mul(-1);
			}

			if (typeof collision.obj0 === "string" || collision.obj0.mass === 0) { // static-dynamic collision
				const obj = collision.obj1;
				obj.position.addFactor(collision.normal, collision.depth);

				const vn = collision.normal.clone().mul(collision.normal.dot(obj.velocity));
				const vt = obj.velocity.clone().sub(vn);
				vt.mul(Math.exp(-obj.friction * dt)); // TODO: proper friction simulation
				vn.mul(-obj.elasticity).add(vt);

				obj.velocity.set(vn);

				if (obj.parent.collisionCallback)
					obj.parent.collisionCallback(typeof collision.obj0 === "string"
						? collision.obj0 : collision.obj0.parent);
			}
			else { // dynamic-dynamic collision
				const obj0 = collision.obj0;
				const obj1 = collision.obj1;

				// TODO: support friction

				obj0.position.addFactor(collision.normal, -collision.depth / 2);
				obj1.position.addFactor(collision.normal, collision.depth / 2);
				const elasticity = (obj0.elasticity + obj1.elasticity) / 2;
				const p = 2 * (obj0.velocity.dot(collision.normal)
					- obj1.velocity.dot(collision.normal)) / (obj0.mass + obj1.mass)
					* elasticity;
				obj0.velocity.addFactor(collision.normal, -p * obj0.mass);
				obj1.velocity.addFactor(collision.normal, p * obj1.mass);

				if (obj0.parent.collisionCallback)
					obj0.parent.collisionCallback(obj1.parent);
				if (obj1.parent.collisionCallback)
					obj1.parent.collisionCallback(obj0.parent);
			}
		}
	}

	applySprings(dt: number) {
		for (const spring of this.springs) {
			if (spring.obj0.mass === 0 && spring.obj1.mass === 0)
				continue;
			let obj0 = spring.obj0;
			let obj1 = spring.obj1;
			if (spring.obj1.mass === 0) {
				const temp = obj0;
				obj0 = obj1;
				obj1 = temp;
			}

			const distance = spring.obj0.position.distanceTo(spring.obj1.position);
			const n = spring.obj1.position.clone().sub(spring.obj0.position).normalize();
			const dv = spring.obj1.velocity.clone().sub(spring.obj0.velocity);
			const vn = dv.dot(n);
			if (spring.obj0.mass === 0) {
				const sum = (spring.strength * (spring.length - distance) - spring.damping * vn) * dt;
				spring.obj1.velocity.addFactor(n, sum);
			}
			else {
				const sum = (spring.strength * (spring.length - distance) - spring.damping * vn) / (spring.obj0.mass + spring.obj1.mass) * dt;
				spring.obj0.velocity.addFactor(n, -sum * spring.obj1.mass);
				spring.obj1.velocity.addFactor(n, sum * spring.obj0.mass);
			}
		}
	}

	applySoftBodies(dt: number) {
		if (!this.softBodyStructure)
			return;

		for (const body of this.bodies) {
			const centerOfMass = body.computeCenterOfMass();

			let A = 0, B = 0;
			for (let i = 0; i < body.nodes.length; ++i) {
				const v = body.nodes[i];
				const r = v.position.clone().sub(centerOfMass);
				A += r.dot(body.idealPositions[i]);
				B += r.cross(body.idealPositions[i]);
			}
			const angle = -Math.atan2(B, A);

			const bodyVelocity = body.computeVelocity();
			const angularVelocity = body.computeAngularVelocity();

			for (let i = 0; i < body.nodes.length; ++i) {
				const v = body.nodes[i];
				const target = centerOfMass.clone().add(body.idealPositions[i].clone().rotate(angle));
				const targetR = body.idealPositions[i].length();
				const targetAngularAxis = target.clone().sub(centerOfMass).normalize().rot90();
				const targetVelocity = targetAngularAxis.mul(angularVelocity * targetR / v.mass)
					.add(bodyVelocity);

				const n = target.sub(v.position);
				const distance = n.length();
				n.normalize();

				const dv = targetVelocity.clone().sub(v.velocity);
				const vn = dv.dot(n);
				v.velocity.addFactor(n, (1000 * distance + 10 * vn) * dt);
			}
		}
	}

	fixedStep(dt: number) {
		this.applyCollisions(dt);
		this.applySprings(dt);
		this.applySoftBodies(dt);
		this.applyGravity(dt);
		for (const obj of this.objects)
			obj.position.addFactor(obj.velocity, dt);
	}

	private lag: number = 0;
	step(dt: number) {
		this.lag += dt;
		const numTicks = Math.min(this.lag / PHYSICS_TIME_STEP, 1 / PHYSICS_TIME_STEP) | 0;
		this.lag %= PHYSICS_TIME_STEP;
		for (let i = 0; i < numTicks; ++i)
			this.fixedStep(PHYSICS_TIME_STEP);
	}

}

export class Spring {

	length: number = 10;
	strength: number = 20;
	damping: number = 10;

	constructor(public obj0: PointMass, public obj1: PointMass) {}

	autoLength() {
		this.length = this.obj0.position.distanceTo(this.obj1.position);
	}

}

export class PointMass {

	constructor(public parent: SoftBody) {}

	collisionGroup: any = undefined;
	radius: number = 1;
	mass: number = 1;
	elasticity: number = 0.7;
	friction: number = 15;
	userdata: any;
	readonly velocity = new Vec2(0);
	readonly position = new Vec2(0);

	clone() {
		const result = new PointMass(this.parent);
		result.collisionGroup = this.collisionGroup;
		result.radius = this.radius;
		result.mass = this.mass;
		result.elasticity = this.elasticity;
		result.friction = this.friction;
		result.userdata = this.userdata;
		result.velocity.set(this.velocity);
		result.position.set(this.position);
		return result;
	}

}

export class SoftBody {

	nodes: PointMass[] = [];
	idealPositions: Vec2[] = [];
	userdata: any;

	collisionCallback?: (obj: SoftBody | WorldBoundary) => void;

	applyAngularImpulse(impulse: number) {
		const centerOfMass = this.computeCenterOfMass();
		for (let i = 0; i < this.nodes.length; ++i) {
			const v = this.nodes[i];
			const r = v.position.distanceTo(centerOfMass);
			const angularAxis = v.position.clone().sub(centerOfMass).normalize().rot90();
			v.velocity.addFactor(angularAxis, impulse * r);
		}
	}

	applyImpulse(impulse: Vec2): void;
	applyImpulse(x: number, y: number): void;
	applyImpulse(x: number | Vec2, y?: number) {
		if (typeof x !== "number") {
			y = x.y;
			x = x.x;
		}

		if (y === undefined) throw 0;

		for (let i = 0; i < this.nodes.length; ++i) {
			const v = this.nodes[i];
			v.velocity.x += x;
			v.velocity.y += y;
		}
	}

	move(amount: Vec2): void;
	move(x: number, y: number): void;
	move(x: number | Vec2, y?: number) {
		if (typeof x !== "number") {
			y = x.y;
			x = x.x;
		}

		if (y === undefined) throw 0;

		for (let i = 0; i < this.nodes.length; ++i) {
			const v = this.nodes[i];
			v.position.x += x;
			v.position.y += y;
		}
	}

	computeCenterOfMass(target: Vec2 = new Vec2(0)): Vec2 {
		target.set(0);

		let totalMass = 0;
		for (const node of this.nodes) {
			target.addFactor(node.position, node.mass);
			totalMass += node.mass;
		}

		target.div(totalMass);

		return target;
	}

	computeVelocity(target: Vec2 = new Vec2(0)): Vec2 {
		target.set(0);

		let totalMass = 0;
		for (const node of this.nodes) {
			target.addFactor(node.velocity, node.mass);
			totalMass += node.mass;
		}

		target.div(totalMass);
		return target;
	}

	computeAngularVelocity() {
		const centerOfMass = this.computeCenterOfMass();

		let angularVelocity = 0;
		let totalMass = 0;
		for (const node of this.nodes) {
			const r = node.position.distanceTo(centerOfMass);
			const angularAxis = node.position.clone().sub(centerOfMass).normalize().rot90();
			angularVelocity += node.velocity.dot(angularAxis) / r * node.mass;
			totalMass += node.mass;
		}

		return angularVelocity / totalMass;
	}

}
