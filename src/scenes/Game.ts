import Phaser from 'phaser';
import { IPoint, Point } from '../util/geom/point.ts';
import { PuzzlePiece, SNAP_GRID } from '../sprites/PuzzlePiece.ts';
import { DragDropBehavior } from '../phaser/DragDropBehavior.ts';
import { randomInt } from '../util/random.ts';
import { roundToMultiple } from '../util/math.ts';
import { PuzzleGraphics } from '../PuzzleGraphics.ts';
import { notNull } from '../util/assert.ts';
import { IslandScene } from '../IslandScene.ts';

export default class extends Phaser.Scene {

	constructor() {
		super({ key: 'GameScene' });
	}

	init() {}
	preload() {}
	
	puzzlePieces: PuzzlePiece[] = [];

	puzzle: PuzzleGraphics | undefined = undefined;

	private texture: Phaser.Textures.DynamicTexture | undefined = undefined;

	async createPuzzlePieces() {
		this.puzzle = new PuzzleGraphics(this, this.textureSize, this.gridSize);
		
		await this.puzzle.generatePuzzleTexture();
		this.puzzle.generateMasks();

		const texSize = this.textureSize;
		const gridSize = this.gridSize;

		for (const piece of this.puzzle.pieces) {
			const puzzlePiece = new PuzzlePiece(this, 0, 0, { gridPos: piece, texSize, gridSize, margin: this.margin, maskImage: piece.maskImage });
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
		
		// TODO: move to PuzzleGraphics:
		this.textures.remove('island');
		this.textures.remove('shaderTexture');
		for (const piece of this.puzzlePieces) {
			this.textures.remove(`piece-${piece.config.gridPos.x}-${piece.config.gridPos.y}`);
			this.textures.remove(`mask-${piece.config.gridPos.x}-${piece.config.gridPos.y}`);
		}

		this.puzzlePieces = [];
		// TODO: remove dragDrop listeners?
		this.islandScene = undefined;
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
	private targetNumPieces = 4;

	create() {
		this.initLevel();
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
		} while (this.gridSize.x * this.gridSize.y < this.targetNumPieces);
		
		this.textureSize = Point.scale(this.gridSize, targetPieceSize);
		this.margin = canvasSize.minus(this.textureSize).scale(0.5);

		this.texture = notNull(this.textures.addDynamicTexture('shaderTexture', this.textureSize.x, this.textureSize.y)).setIsSpriteTexture(false);
		
		this.add.rectangle(this.margin.x, this.margin.y, this.textureSize.x, this.textureSize.y, 0xAAAAAA).setOrigin(0).setDepth(-1);
		await this.createPuzzlePieces();

		this.scatterPuzzlePieces();

		const dragDropBehavior = new DragDropBehavior();
		dragDropBehavior.findDragTarget = (pointer: IPoint) => {
			// take depth into account when finding drag target
			this.puzzlePieces.sort((a, b) => b.depth - a.depth);
			return this.puzzlePieces.find(p => p.contains(pointer));
		};
		dragDropBehavior.apply(this);

		this.islandScene = new IslandScene(this, this.texture);
		this.islandScene.init();
	}

	islandScene: IslandScene | undefined = undefined;

	update() {
		this.islandScene?.update();
	}
}
