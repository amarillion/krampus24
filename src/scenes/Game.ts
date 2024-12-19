import Phaser from 'phaser';
import { notNull } from '../util/assert.ts';
import { IslandMap } from '../islandMap.js';
import paletteUrl from '../assets/island-palette.png?url';

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'GameScene' });
	}

	init() {}
	preload() {}

	async createImage() {
		const canvasTexture = notNull(this.textures.createCanvas('island', 800, 800));

		const canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
		const context = notNull(canvas.getContext('2d'));

		const islandMap = new IslandMap({ width: 800, height: 800, paletteUrl });
		const imageData = islandMap.generate();

		// Draw image data to the canvas
		context.putImageData(await imageData, 0, 0);
		
		canvasTexture.refresh(); // only needed in case we're on WebGL...

		this.add.image(0, 0, 'island').setOrigin(0).setScale(1.0);

		this.add.text(100, 100, 'Phaser 3 - TypeScript - Vite ', {
			font: '64px Bangers',
			color: '#7744ff',
		});

	}

	create() {
		// async delegate...
		this.createImage();
	}
}
