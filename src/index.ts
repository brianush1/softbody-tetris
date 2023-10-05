import { Renderer } from "./renderer";
import { gameTick, world } from "./game";

Renderer.instance = new Renderer();

let lastTickTime = performance.now() / 1000;
function tick() {
	requestAnimationFrame(tick);

	const now = performance.now() / 1000;
	world.step(now - lastTickTime);
	gameTick(now - lastTickTime);
	lastTickTime = now;

	Renderer.instance.render();
}

tick();
