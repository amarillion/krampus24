import Phaser from 'phaser';
import { notNull } from '../util/assert.ts';
import { IslandMap } from '../islandMap.js';
import paletteUrl from '../assets/island-palette.png?url';
import { JigsawCutout } from '../board/jigsaw-cutout.ts';
import { IPoint, Point } from '../util/geom/point.ts';
import { PuzzlePiece } from '../sprites/PuzzlePiece.ts';
import { DragDropBehavior } from '../phaser/DragDropBehavior.ts';

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'GameScene' });
	}

	init() {}
	preload() {}
	
	puzzlePieces: PuzzlePiece[] = [];

	async createImages() {
		const width = 800;
		const height = 800;
		const mapSize = new Point(width, height);
		const piecesX = 8;
		const piecesY = 8;
		const puzzleSize = new Point(piecesX, piecesY);

		const islandMap = new IslandMap({ width, height, paletteUrl });
		const imageData = await islandMap.generate();

		const clipOutData = JigsawCutout({ piecesX, piecesY, seed: 'cherry' });

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
			const canvasTexture = notNull(this.textures.createCanvas(`piece-${piece.x}-${piece.y}`, width, height));
			const canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
			const context = notNull(canvas.getContext('2d'));
			
			/* set up clip path */
			
			context.lineWidth = 2;
			context.strokeStyle = 'lightgrey';

			context.beginPath();

			let pos = new Point(piece.moveArgs[0] * width, 
				piece.moveArgs[1] * height);
			context.moveTo(pos.x, pos.y);
			for (const edge of piece.edges) {
				for (const segment of edge) {
					if (segment.command === 'l') {
						pos = pos.plus(new Point(segment.args[0], segment.args[1]).times(mapSize));
						context.lineTo(pos.x, pos.y);
					}
					else if (segment.command === 'c') {
						const way1 = pos.plus(new Point(segment.args[0], segment.args[1]).times(mapSize));
						const way2 = pos.plus(new Point(segment.args[2], segment.args[3]).times(mapSize));
						pos = pos.plus(new Point(segment.args[4], segment.args[5]).times(mapSize));
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

			canvasTexture.refresh(); // only needed in case we're on WebGL...

			const puzzlePiece = new PuzzlePiece(this, 0, 0, { gridPos: piece, texSize: mapSize, gridSize: puzzleSize });
			this.add.existing(puzzlePiece);

			this.puzzlePieces.push(puzzlePiece);
		}

		this.add.text(100, 100, 'Phaser 3 - TypeScript - Vite ', {
			font: '64px Bangers',
			color: '#7744ff',
		});
	}

	create() {
		// async delegate...
		this.createImages();

		const dragDropBehavior = new DragDropBehavior();
		
		dragDropBehavior.findDragTarget = (pointer: IPoint) => this.puzzlePieces.find(p => p.contains(pointer));
		dragDropBehavior.apply(this);

	}
}
