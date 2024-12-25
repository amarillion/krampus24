import Phaser from 'phaser';
import { IslandMap } from './islandMap';
import { JigsawCutout } from './board/jigsaw-cutout';
import paletteUrl from './assets/island-palette.png?url';
import { Point } from './util/geom/point.ts';
import { notNull } from './util/assert.ts';

export class PuzzleGraphics {

	scene: Phaser.Scene;
	textureSize: Point;
	gridSize: Point;
	textureKeys: string[] = [];

	constructor(scene: Phaser.Scene, textureSize: Point, gridSize: Point) {
		this.scene = scene;
		this.textureSize = textureSize;
		this.gridSize = gridSize;
		scene.events.once('destroy', () => {
			this.removeTextures();
		});
	}

	async generatePuzzleTexture() {
		const texSize = this.textureSize;

		const islandMap = new IslandMap({ width: texSize.x, height: texSize.y, paletteUrl });
		const imageData = await islandMap.generate();

		// generate full map.
		const canvasTexture = this.createTexture('island', texSize);
		const canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
		const context = notNull(canvas.getContext('2d'));

		context.putImageData(imageData, 0, 0);
		canvasTexture.refresh(); // only needed in case we're on WebGL...

		const bmp = await createImageBitmap(imageData);
		return bmp;
	}

	// generate island graphics texture
	async generatePieceTextures() {
		const texSize = this.textureSize;
		const bmp = await this.generatePuzzleTexture();
		
		const gridSize = this.gridSize;
		const clipOutData = JigsawCutout({ piecesX: gridSize.x, piecesY: gridSize.y, seed: 'cherry' });
		// this.add.image(0, 0, 'island').setOrigin(0).setScale(1.0);

		// Draw image data to the canvas
		
		for (const piece of clipOutData.pieces) {
			const textureKey = `piece-${piece.x}-${piece.y}`;
			const canvasTexture = this.createTexture(textureKey, texSize);
			const canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
			const context = notNull(canvas.getContext('2d'));
			
			/* set up clip path */
			
			context.lineWidth = 2;
			context.strokeStyle = 'lightgrey';

			context.beginPath();

			let pos = new Point(piece.moveArgs[0], piece.moveArgs[1]).times(texSize);
			context.moveTo(pos.x, pos.y);
			for (const edge of piece.edges) {
				for (const segment of edge) {
					if (segment.command === 'l') {
						pos = pos.plus(new Point(segment.args[0], segment.args[1]).times(texSize));
						context.lineTo(pos.x, pos.y);
					}
					else if (segment.command === 'c') {
						const way1 = pos.plus(new Point(segment.args[0], segment.args[1]).times(texSize));
						const way2 = pos.plus(new Point(segment.args[2], segment.args[3]).times(texSize));
						pos = pos.plus(new Point(segment.args[4], segment.args[5]).times(texSize));
						context.bezierCurveTo(
							way1.x, way1.y,
							way2.x, way2.y,
							pos.x, pos.y);
					}
				}
			}
			context.stroke();
			context.clip();

			// use drawImage instead of putImageData, the latter doesn't adhere to clip rect.
			context.drawImage(bmp, 0, 0);

			canvasTexture.refresh(); // only needed in case we're on WebGL...
		}
	}

	private createTexture(textureKey: string, texSize: Point) {
		const canvasTexture = notNull(this.scene.textures.createCanvas(textureKey, texSize.x, texSize.y));
		this.textureKeys.push(textureKey);
		return canvasTexture;
	}

	removeTextures() {
		for (const textureKey of this.textureKeys) {
			console.log(`Removing ${textureKey}`);
			this.scene.textures.remove(textureKey);
		}
	}
}
