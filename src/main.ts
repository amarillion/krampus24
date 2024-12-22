import Phaser from 'phaser';

import BootScene from './scenes/Boot.js';
import SplashScene from './scenes/Splash.js';
import GameScene from './scenes/Game.js';

import { WebComponentScene } from './phaser/WebComponentScene.js';

const gameConfig = {
	type: Phaser.AUTO,
	parent: 'content',
	width: 1280,
	height: 800,
	localStorageName: 'phaseres6webpack',
	scene: [ BootScene, SplashScene, GameScene, new WebComponentScene({ key: 'TitleScreen', next: 'GameScene' }) ]
}

class Game extends Phaser.Game {
	constructor() {
		super(gameConfig);
	}
}

export const game = new Game();
