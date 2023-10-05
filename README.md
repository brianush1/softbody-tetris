# Soft-body Tetris

[Play it here](https://brian.ac/softbody-tetris/)

## Code structure

|File|Purpose|
|-|-|
|index.ts|The entrypoint to the game; manages the `requestAnimationFrame` loop|
|game.ts|Implements all the game logic and controls, and calls into the physics engine|
|physics.ts|Somewhat-standalone soft-body physics engine|
|renderer.ts|Self-explanatory|
