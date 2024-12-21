import { Draggable } from "../phaser/DragDropBehavior";
import { IPoint, Point } from "../util/geom/point";

export type PuzzlePieceConfig = {
	texSize: IPoint, // size of puzzle texture
	gridSize: IPoint, // size of puzzle grid
	gridPos: IPoint, // position within the puzzle grid
}

export class PuzzlePiece extends Phaser.GameObjects.Image implements Draggable {

	config: PuzzlePieceConfig;
	pieceSize: Point;
	pieceOrigin: Point;

	constructor(scene: Phaser.Scene, x: number, y: number, config : PuzzlePieceConfig) {
		const { gridPos, texSize, gridSize } = config;
		super(scene, x, y, `piece-${gridPos.x}-${gridPos.y}`);
		this.config = { ...config };
		this.pieceSize = new Point(texSize.x / gridSize.x, texSize.y / gridSize.y);
		this.pieceOrigin = this.pieceSize.times(gridPos);

		// by default, Origin is 0.5, meaning that the center of the puzzle will be drawn at screen coordinate 0,0.
		// because we're working with a texture that is the same size as the entire puzzle, this won't do.
		this.setOrigin(0);
	}

	dragDelta: Point = new Point(0, 0);
	dragOrigin: Point = new Point(0, 0);

	dragRelease(pointer: IPoint) {
		// TODO
	}

	dragStart(pointer: IPoint) {
		this.dragDelta = Point.minus(pointer, this);
		this.dragOrigin = new Point(pointer.x, pointer.y);
	}

	dragMove(pointer: IPoint) {
		this.setPosition(pointer.x - this.dragDelta.x, pointer.y - this.dragDelta.y);
	}

	dragCancel(pointer: IPoint) {
		this.setPosition(this.dragOrigin.x, this.dragOrigin.y);
	}

	contains(pointer: IPoint) {
		const delta = Point.minus(pointer, this.pieceOrigin);
		return (this.pieceSize.contains(delta));
	}

}