import Phaser from 'phaser';

import BootScene from './scenes/Boot.js';
import SplashScene from './scenes/Splash.js';
import LevelScene from './scenes/Level.js';

import { WebComponentScene } from './phaser/WebComponentScene.js';

const gameConfig = {
	type: Phaser.AUTO,
	disableContextMenu: true,
	backgroundColor: '#ffffbb',
	fps: { target: 60 },
	scale: { mode: Phaser.Scale.RESIZE },
	localStorageName: 'krampus64-amarillion',
	scene: [
		BootScene,
		SplashScene,
		LevelScene,
		new WebComponentScene({ key: 'TitleScreen', next: 'LevelScene' }),
	],
};

class Game extends Phaser.Game {
	constructor() {
		super(gameConfig);
	}
}

export const game = new Game();
