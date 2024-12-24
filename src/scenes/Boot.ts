import Phaser from 'phaser';
import WebFont from 'webfontloader';

import pickupPieceSfxUrl from '../assets/Menu_manipulation_sound_2.ogg?url';
import dropPieceSfxUrl from '../assets/Footsteps_single.ogg?url';
import levelCompleteSfxUrl from '../assets/Victory_2.ogg?url';

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
		this.load.audio('pickup-puzzle-piece', pickupPieceSfxUrl);
		this.load.audio('drop-puzzle-piece', dropPieceSfxUrl);
		this.load.audio('level-complete', levelCompleteSfxUrl);
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
