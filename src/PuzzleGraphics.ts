import Phaser from 'phaser';
import { IslandMap } from './islandMap';
import { JigsawCutout, type PiecesType } from './board/jigsaw-cutout';
import paletteUrl from './assets/island-palette.png?url';
import { Point } from './util/geom/point.ts';
import { notNull } from './util/assert.ts';

export class PuzzleGraphics {

	scene: Phaser.Scene;
	textureSize: Point;
	gridSize: Point;
	clipOutData: PiecesType;
	pieces: { x: number, y: number, maskImage: Phaser.GameObjects.Image }[] = [];

	constructor(scene: Phaser.Scene, textureSize: Point, gridSize: Point) {
		this.scene = scene;
		this.textureSize = textureSize;
		this.gridSize = gridSize;
		this.clipOutData = JigsawCutout({ piecesX: gridSize.x, piecesY: gridSize.y, seed: 'cherry' });
	}

	// Convert Canvas.ImageData to a Phaser Texture
	// TODO: move to utility class
	static imageDataToTexture(scene: Phaser.Scene, imageData: ImageData, key: string, width: number, height: number) {
		const canvasTexture = notNull(scene.textures.createCanvas(key, width, height));

		const canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
		const context = notNull(canvas.getContext('2d'));

		context.putImageData(imageData, 0, 0);
		canvasTexture.refresh(); // only needed in case we're on WebGL...
	}

	async generatePuzzleTexture() {
		const texSize = this.textureSize;

		const islandMap = new IslandMap({ width: texSize.x, height: texSize.y, paletteUrl });
		const imageData = await islandMap.generate();

		// create a texture
		PuzzleGraphics.imageDataToTexture(this.scene, imageData, 'island', texSize.x, texSize.y);

		const bmp = await createImageBitmap(imageData);
		return bmp;
	}

	generateMasks() {
		const texSize = this.textureSize;
		for (const piece of this.clipOutData.pieces) {
			const key = `mask-${piece.x}-${piece.y}`;
			const canvasTexture = notNull(this.scene.textures.createCanvas(key, texSize.x, texSize.y));
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
			context.fillStyle = 'red';
			context.fillRect(0, 0, texSize.x, texSize.y);

			canvasTexture.refresh(); // only needed in case we're on WebGL...

			const maskImage = new Phaser.GameObjects.Image(this.scene, 0, 0, key).setOrigin(0);
			
			this.pieces.push({ x: piece.x, y: piece.y, maskImage });
		}
	}

	async generatePieceTextures() {
		const texSize = this.textureSize;
		const bmp = await this.generatePuzzleTexture();
		
		// Draw image data to the canvas
		for (const piece of this.clipOutData.pieces) {
			const canvasTexture = notNull(this.scene.textures.createCanvas(`piece-${piece.x}-${piece.y}`, texSize.x, texSize.y));
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
}
