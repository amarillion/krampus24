import Phaser from 'phaser';
import { notNull } from '../util/assert.ts';
import { IslandMap } from '../islandMap.js';
import paletteUrl from '../assets/island-palette.png?url';
import { JigsawCutout } from '../board/jigsaw-cutout.ts';
import { IPoint, Point } from '../util/geom/point.ts';
import { PuzzlePiece, SNAP_GRID } from '../sprites/PuzzlePiece.ts';
import { DragDropBehavior } from '../phaser/DragDropBehavior.ts';
import { randomInt } from '../util/random.ts';
import { roundToMultiple } from '../util/math.ts';

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'GameScene' });
	}

	init() {}
	preload() {}
	
	puzzlePieces: PuzzlePiece[] = [];

	async createImages() {

		const texSize = this.textureSize;
		const gridSize = this.gridSize;

		const islandMap = new IslandMap({ width: texSize.x, height: texSize.y, paletteUrl });
		const imageData = await islandMap.generate();

		const clipOutData = JigsawCutout({ piecesX: gridSize.x, piecesY: gridSize.y, seed: 'cherry' });

		// generate full map.
		{
			const canvasTexture = notNull(this.textures.createCanvas('island', texSize.x, texSize.y));

			const canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
			const context = notNull(canvas.getContext('2d'));

			context.putImageData(imageData, 0, 0);
			canvasTexture.refresh(); // only needed in case we're on WebGL...
		}

		// this.add.image(0, 0, 'island').setOrigin(0).setScale(1.0);

		// Draw image data to the canvas
		const bmp = await createImageBitmap(imageData);

		for (const piece of clipOutData.pieces) {
			const canvasTexture = notNull(this.textures.createCanvas(`piece-${piece.x}-${piece.y}`, texSize.x, texSize.y));
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
							pos.x, pos.y)
					}
				}
			}
			context.stroke();
			context.clip();

			// use drawImage instead of putImageData, the latter doesn't adhere to clip rect.
			context.drawImage(bmp, 0, 0);

			canvasTexture.refresh(); // only needed in case we're on WebGL...

			const puzzlePiece = new PuzzlePiece(this, 0, 0, { gridPos: piece, texSize, gridSize, margin: this.margin });
			this.add.existing(puzzlePiece);

			this.puzzlePieces.push(puzzlePiece);
		}

		// add event listeners
		for (const piece of this.puzzlePieces) {
			piece.on('piece-in-place', () => this.checkPuzzleComplete());
			piece.on('sfx', this.playSample);
		}
	}

	reset() {
		// TODO: cleaner solution to make each level its own Scene, and destroy that.
		// no risk of lingering references...
		this.children.each(c => c.destroy());
		this.children.removeAll();
		this.textures.remove('island');
		for (const piece of this.puzzlePieces) {
			this.textures.remove(`piece-${piece.config.gridPos.x}-${piece.config.gridPos.y}`);
		}
		this.puzzlePieces = [];
		// TODO: remove dragDrop listeners?
	}

	playSample(sfxId: string) {
		console.log(`Please play sfx ${sfxId}`);
	}

	checkPuzzleComplete() {
		if (this.puzzlePieces.every(i => i.isCorrectPosition())) {
			this.add.text(100, 100, 'Congratulations - Puzzle Complete!', {
				font: '64px Bangers',
				color: '#7744ff',
			});
				// TODO: particle effect
			this.playSample('puzzle-complete');

			setTimeout(() => {
				this.targetNumPieces += 3;
				this.initLevel();
			}, 5000);
		}
	}

	scatterPuzzlePieces() {
		// TODO: Point.divide
		const pieceSize = new Point(this.textureSize.x / this.gridSize.x, this.textureSize.y / this.gridSize.y);
		for (const piece of this.puzzlePieces) {
			
			let x = randomInt(this.textureSize.x - pieceSize.x);
			let y = randomInt(this.textureSize.y - pieceSize.y);
			
			// correction because each piece is actually a full-size texture.
			x -= (piece.config.gridPos.x * pieceSize.x);
			y -= (piece.config.gridPos.y * pieceSize.y);

			x -= x % 20;
			y -= y % 20;
			piece.setPosition(x, y);
		}
	}

	private textureSize = new Point(0, 0);
	private gridSize = new Point(0, 0);
	private margin = new Point(0, 0);

	// determines level...
	private targetNumPieces = 10;

	create() {
		this.initLevel()
	}

	async initLevel() {
		this.reset();

		const { width, height } = this.sys.game.canvas;
		const canvasSize = new Point(width, height);

		let targetPieceSize = roundToMultiple(320, SNAP_GRID);
		
		do {
			targetPieceSize -= SNAP_GRID;
			this.gridSize = new Point(
				Math.max(2, Math.floor(canvasSize.x / targetPieceSize - 0.5)), 
				Math.max(2, Math.floor(canvasSize.y / targetPieceSize - 0.5))
			);
		} while (this.gridSize.x * this.gridSize.y < this.targetNumPieces)
		
		this.textureSize = Point.scale(this.gridSize, targetPieceSize);
		this.margin = canvasSize.minus(this.textureSize).scale(0.5);
		
		this.add.rectangle(this.margin.x, this.margin.y, this.textureSize.x, this.textureSize.y, 0xAAAAAA).setOrigin(0).setDepth(-1);
		await this.createImages();

		this.scatterPuzzlePieces();

		const dragDropBehavior = new DragDropBehavior();
		dragDropBehavior.findDragTarget = (pointer: IPoint) => {
			// take depth into account when finding drag target
			this.puzzlePieces.sort((a, b) => b.depth - a.depth);
			return this.puzzlePieces.find(p => p.contains(pointer));
		}
		dragDropBehavior.apply(this);
	}
}
