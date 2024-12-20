import Phaser from 'phaser';
import { notNull } from '../util/assert.ts';
import { IslandMap } from '../islandMap.js';
import paletteUrl from '../assets/island-palette.png?url';
import { JigsawCutout } from '../board/jigsaw-cutout.ts';
import { Point } from '../util/geom/point.ts';

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'GameScene' });
	}

	init() {}
	preload() {}
	
	async createImages() {
		const islandMap = new IslandMap({ width: 800, height: 800, paletteUrl });
		const imageData = await islandMap.generate();

		const clipOutData = JigsawCutout({ piecesX: 8, piecesY: 8, seed: 'cherry' });

		// generate full map.
		{
			const canvasTexture = notNull(this.textures.createCanvas('island', 800, 800));

			const canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
			const context = notNull(canvas.getContext('2d'));

			context.putImageData(imageData, 0, 0);
			canvasTexture.refresh(); // only needed in case we're on WebGL...
		}

		// this.add.image(0, 0, 'island').setOrigin(0).setScale(1.0);

		// Draw image data to the canvas
		const bmp = await createImageBitmap(imageData);

		for (const piece of clipOutData.pieces) {
			const canvasTexture = notNull(this.textures.createCanvas(`piece-${piece.x}-${piece.y}`, 800, 800));
			const canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
			const context = notNull(canvas.getContext('2d'));
			
			/* set up clip path */
			
			context.lineWidth = 2;
			context.strokeStyle = 'lightgrey';

			context.beginPath();
			const width = 800;
			const height = 800;
			let pos = new Point(piece.moveArgs[0] * width, 
				piece.moveArgs[1] * height);
			context.moveTo(pos.x, pos.y);
			for (const edge of piece.edges) {
				for (const segment of edge) {
					if (segment.command === 'l') {
						pos = pos.plus(new Point(segment.args[0], segment.args[1]).mul(800));
						context.lineTo(pos.x, pos.y);
					}
					else if (segment.command === 'c') {
						const way1 = pos.plus(new Point(segment.args[0], segment.args[1]).mul(800));
						const way2 = pos.plus(new Point(segment.args[2], segment.args[3]).mul(800));
						pos = pos.plus(new Point(segment.args[4], segment.args[5]).mul(800));
						context.bezierCurveTo(
							way1.x, way1.y,
							way2.x, way2.y,
							pos.x, pos.y)
					}
				}
			}
			context.stroke();
			context.clip();

			// use drawImage instead of putImageData, the latter doesn't adhere to clip rect.
			context.drawImage(bmp, 0, 0);
			// context.stroke();
			// context.closePath();

			canvasTexture.refresh(); // only needed in case we're on WebGL...
			const img = this.add.image(Math.random() * 1200, Math.random() * 800, `piece-${piece.x}-${piece.y}`)
				.setOrigin(piece.moveArgs[0], piece.moveArgs[1]) // TODO: this sets the anchor to the top-right corner, which is not ideal for rotation...
				.setScale(1.0);
			img.setAngle(Math.random() * 360);
		}


		this.add.text(100, 100, 'Phaser 3 - TypeScript - Vite ', {
			font: '64px Bangers',
			color: '#7744ff',
		});
	}

	create() {
		// async delegate...
		this.createImages();
	}
}
