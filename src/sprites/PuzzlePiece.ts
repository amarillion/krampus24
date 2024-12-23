import { Draggable } from '../phaser/DragDropBehavior';
import { IPoint, Point } from '../util/geom/point';
import { roundToMultiple } from '../util/math';

export const SNAP_GRID = 20;

export type PuzzlePieceConfig = {
	texSize: IPoint, // size of puzzle texture
	margin: IPoint, // target position in pixel coordinates
	gridSize: IPoint, // size of puzzle grid
	gridPos: IPoint, // position within the puzzle grid
};

export class PuzzlePiece extends Phaser.GameObjects.Image implements Draggable {

	config: PuzzlePieceConfig;
	pieceSize: Point;
	pieceOrigin: Point;
	originalDepth: number;

	constructor(scene: Phaser.Scene, x: number, y: number, config: PuzzlePieceConfig) {
		const { gridPos, texSize, gridSize } = config;
		super(scene, x, y, `piece-${gridPos.x}-${gridPos.y}`);
		this.config = { ...config };
		this.pieceSize = new Point(texSize.x / gridSize.x, texSize.y / gridSize.y);
		this.pieceOrigin = this.pieceSize.times(gridPos);

		// by default, Origin is 0.5, meaning that the center of the puzzle will be drawn at screen coordinate 0,0.
		// because we're working with a texture that is the same size as the entire puzzle, this won't do.
		this.setOrigin(0);
		this.originalDepth = Math.random(); // depth value between 0 and 1. 0 is puzzle layer, 1 is drag layer.
		this.setDepth(this.originalDepth);
	}

	dragDelta: Point = new Point(0, 0);
	dragOrigin: Point = new Point(0, 0);

	dragRelease(pointer: IPoint) {
		let target = Point.minus(pointer, this.dragDelta).minus(this.config.margin);
		target.x = roundToMultiple(target.x, SNAP_GRID);
		target.y = roundToMultiple(target.y, SNAP_GRID);
		target = target.plus(this.config.margin);
		
		const scene = this.scene;
		scene.tweens.add({
			targets: [ this ],
			duration: 300,
			x: target.x,
			y: target.y,
			onComplete: () => {
				this.setTint();
				if (this.isCorrectPosition()) {
					this.emit('piece-in-place', this);
					this.setDepth(0); // below all the incorrect pieces
				}
				else {
					this.setDepth(this.originalDepth); // back in the puzzle layer
				}
			},
		});

		// TODO: listen for event
		this.emit('sfx', 'drop-puzzle-piece');
	}

	isCorrectPosition() {
		// with full-size textures, correct position for all pieces is 0,0
		return (this.x === this.config.margin.x && this.y === this.config.margin.y);
	}

	dragStart(pointer: IPoint) {
		this.dragDelta = Point.minus(pointer, this);
		this.dragOrigin = new Point(pointer.x, pointer.y);
		this.setDepth(1); // draw on top of rest...
		this.setTint(0xAAFFFF);

		// TODO: listen for event
		this.emit('sfx', 'pickup-puzzle-piece');
	}

	dragMove(pointer: IPoint) {
		this.setPosition(pointer.x - this.dragDelta.x, pointer.y - this.dragDelta.y);
	}

	dragCancel(/* pointer: IPoint */) {
		const scene = this.scene;
		scene.tweens.add({
			targets: [ this ],
			duration: 200,
			x: this.dragOrigin.x,
			y: this.dragOrigin.y,
		});
		this.setDepth(0);
	}

	contains(pointer: IPoint) {
		const delta = Point.minus(pointer, this.pieceOrigin).minus(this);
		return (this.pieceSize.contains(delta));
	}

}
