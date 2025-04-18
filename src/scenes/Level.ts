import Phaser from 'phaser';
import { IPoint, Point } from '../util/geom/point.ts';
import { PuzzlePiece, SNAP_GRID } from '../sprites/PuzzlePiece.ts';
import { DragDropBehavior } from '../phaser/DragDropBehavior.ts';
import { randomInt } from '../util/random.ts';
import { roundToMultiple } from '../util/math.ts';
import { PuzzleGraphics } from '../PuzzleGraphics.ts';
import { FpsLabel } from '../phaser/FpsLabel.ts';
import { pointRange } from '../util/geom/pointRange.ts';
import { Victory } from '../victory.ts';
import { assert } from '../util/assert.ts';
import { Params } from '../Params.ts';

export default class LevelScene extends Phaser.Scene {

	constructor() {
		super({ key: 'LevelScene' });
	}

	init() {}
	preload() {

	}
	
	puzzlePieces: PuzzlePiece[] = [];

	puzzle: PuzzleGraphics | undefined = undefined;

	victory: Victory | undefined = undefined;

	async createPuzzlePieces() {
		this.puzzle = new PuzzleGraphics(this, this.textureSize, this.gridSize);

		await this.puzzle.generatePieceTextures();

		const texSize = this.textureSize;
		const gridSize = this.gridSize;

		for (const piece of pointRange(gridSize.x, gridSize.y)) {
			const puzzlePiece = new PuzzlePiece(this, 0, 0, { gridPos: piece, texSize, gridSize, margin: this.margin });
			this.add.existing(puzzlePiece);

			this.puzzlePieces.push(puzzlePiece);
		}

		// add event listeners
		for (const piece of this.puzzlePieces) {
			piece.on('piece-in-place', () => this.checkPuzzleComplete());
			piece.on('sfx', (sfxId: string) => this.playSample(sfxId));
		}
	}

	private readonly soundMap: Record<string, Phaser.Sound.BaseSound> = {};

	playSample(sfxId: string) {
		if (!(sfxId in this.soundMap)) {
			console.log(`Sfx ${sfxId} requested but not found`);
		}
		else {
			this.soundMap[sfxId].play();
		}
	}

	checkPuzzleComplete() {
		if (this.puzzlePieces.every(i => i.isCorrectPosition())) {
			
			const text = this.add.text(-1000, 100, 'Congratulations - Puzzle Complete!', {
				font: '64px Bangers',
				color: '#7744ff',
			});

			this.tweens.add({
				targets: [ text ],
				duration: 5000,
				x: 1000,
			});
			
			this.playSample('level-complete');

			this.victory?.init();

			setTimeout(() => {
				this.nextLevel();
			}, 5000);
		}
	}

	nextLevel() {
		// increase difficulty for next level scene
		this.registry.set('targetNumPieces', (this.registry.get('targetNumPieces') as number) + Params.levelIncrease);

		// recommended way to switch scene according to https://docs.phaser.io/phaser/concepts/scenes

		// After destruction, `this.scene` and `this.sys.scenePlugin` are unusable.
		// So we need to use the manager directly.
		const { manager } = this.scene;

		this.events.once('destroy', () => {
			manager.add('LevelScene', LevelScene);
			manager.start('LevelScene');
		});

		this.scene.remove();
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

	private fpsLabel: FpsLabel | undefined = undefined;

	create() {
		this.victory = new Victory(this);

		this.initLevel();

		for (const sfxId of [ 'pickup-puzzle-piece', 'drop-puzzle-piece', 'level-complete' ]) {
			this.soundMap[sfxId] = this.game.sound.add(sfxId);
		}
	}

	static getOptimalPieceSize(targetNumPieces: number, canvasSize: Point) {
		let gridSize;

		function *pieceSizeVariants(startPieceSize: number) {
			let currentPieceSize = startPieceSize;
			while (currentPieceSize > 2 * SNAP_GRID) {
				for (const [ x, y ] of [ [ 0, 1 ], [ 1, 0 ], [ 1, 1 ], [ 2, 0 ], [ 0, 2 ], [ 2, 1 ], [ 1, 2 ] ]) {
					yield new Point(currentPieceSize, currentPieceSize).minus(Point.scale({ x, y }, SNAP_GRID));
				}
				currentPieceSize -= SNAP_GRID;
			}
		}
		
		const targetPieceSize = roundToMultiple(320, SNAP_GRID);
		for (const pieceSize of pieceSizeVariants(targetPieceSize)) {
			gridSize = new Point(
				Math.max(1, Math.floor(canvasSize.x / pieceSize.x - 0.5)),
				Math.max(1, Math.floor(canvasSize.y / pieceSize.y - 0.5))
			);
			if (gridSize.x * gridSize.y >= targetNumPieces) {
				return { pieceSize, gridSize };
			}
		}

		assert(false);
	}

	async initLevel() {
		const { width, height } = this.sys.game.canvas;
		const canvasSize = new Point(width, height);

		const targetNumPieces = this.registry.get('targetNumPieces') as number;
		
		const { pieceSize, gridSize } = LevelScene.getOptimalPieceSize(targetNumPieces, canvasSize);
				
		this.gridSize = gridSize;
		this.textureSize = Point.times(this.gridSize, pieceSize);
		this.margin = canvasSize.minus(this.textureSize).scale(0.5);
		
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
		
		// uncomment to show FPS on screen.
		// this.fpsLabel = new FpsLabel(this);
		// this.add.existing(this.fpsLabel);
	}

	update(time: number, delta: number) {
		// TODO: how do I make this get called automatically?
		this.fpsLabel?.update(time, delta);

		this.victory?.update();
	}
}
