import Phaser from 'phaser';

export default class extends Phaser.Scene {
	constructor() {
		super({ key: 'SplashScene' });
	}

	preload() {
		//
		// load your assets
		//
		// this.load.image('mushroom', 'images/mushroom2.png');
	}

	create() {
		// initial level state
		this.scene.start('TitleScreen');
	}

	update() {}
}
