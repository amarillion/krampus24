import Phaser from 'phaser';
import WebFont from 'webfontloader';
import mushroomUrl from '../assets/mushroom2.png?url';

export default class extends Phaser.Scene {
	private fontsReady = false;

	constructor() {
		super({ key: 'BootScene' });
	}

	preload() {
		this.fontsReady = false;
		this.fontsLoaded = this.fontsLoaded.bind(this);
		this.add.text(100, 100, 'loading fonts...');

		this.load.image('loaderBg', './images/loader-bg.png');
		this.load.image('loaderBar', './images/loader-bar.png');
		this.load.image('mushroom', mushroomUrl);

		WebFont.load({
			google: {
				families: [ 'Bangers' ],
			},
			active: this.fontsLoaded,
		});
	}

	update() {
		if (this.fontsReady) {
			this.scene.start('SplashScene');
		}
	}

	fontsLoaded() {
		this.fontsReady = true;
	}
}
