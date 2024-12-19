import './style.css'
import { getImageUrl } from './imageUrl.js';

import './components.define.js';

// window.addEventListener('load', async () => {
// 	/*
// 	const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
// 	const ctx = canvas.getContext("2d");

// 	if (ctx) {

// 		const islandMap = new IslandMap({ width: 800, height: 800, paletteUrl });
// 		const imageData = islandMap.generate();
// 		// Draw image data to the canvas
// 		ctx.putImageData(await imageData, 0, 0);
// 	}
// 	*/

// 	const imgElt = document.getElementById('my-img') as HTMLImageElement;
// 	imgElt.src = await getImageUrl();
// 	document.body.appendChild(imgElt);
// });


import Phaser from 'phaser';

import BootScene from './scenes/Boot.js';
import SplashScene from './scenes/Splash.js';
import GameScene from './scenes/Game.js';

import config from './config.js';

const gameConfig = Object.assign(config, {
	scene: [ BootScene, SplashScene, GameScene ],
});

class Game extends Phaser.Game {
	constructor() {
		super(gameConfig);
	}
}

export const game = new Game();
