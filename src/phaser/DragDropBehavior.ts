import { IPoint } from '../util/geom/point.js';

export interface Draggable {
	dragRelease: (pointer: IPoint) => void,
	dragStart: (pointer: IPoint) => void,
	/** Moving the mouse. If mouse moved outside of screen, x and y are negative.  */
	dragMove: (pointer: IPoint) => void,
	dragCancel: (pointer: IPoint) => void,
}

export class DragDropBehavior {

	uiBlocked: () => boolean = () => false;
	findDragTarget: (pointer: IPoint) => Draggable | undefined = () => undefined;

	apply(scene: Phaser.Scene) {
		scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.onDown(pointer));
		scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.onMove(pointer));
		scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.onRelease(pointer));

		// Phaser annoyance: gameout is weird, gameover is weirder.
		// Who thought of naming the event when a pointer enters the game screen 'gameover'???
		scene.input.on('gameout', () => this.onGameOut());
	}

	dragTarget: Draggable | undefined = undefined;

	onDown(pointer: Phaser.Input.Pointer) {
		if (this.uiBlocked()) { return; }

		const match = this.findDragTarget(pointer);
		if (match) {
			this.dragTarget = match;
			this.dragTarget.dragStart(pointer);
			return;
		}
	}

	onMove(pointer: Phaser.Input.Pointer) {
		if (this.uiBlocked()) { return; }

		if (this.dragTarget) {
			if (pointer.isDown) {
				this.dragTarget.dragMove(pointer);
			}
			else {
				// we missed the onRelease event. This can happen if the mouse left the screen and returned...
				this.dragTarget.dragCancel(pointer);
			}
		}
		
	}

	onRelease(pointer: Phaser.Input.Pointer) {
		if (this.uiBlocked()) { return; }

		if (!this.dragTarget) return;

		this.dragTarget.dragRelease(pointer);
		this.dragTarget = undefined;
	}

	onGameOut() {
		if (this.uiBlocked()) { return; }
		if (this.dragTarget) {
			
			// use negative coordinates to indicate out of screen
			// TODO -> something better?
			this.dragTarget.dragMove({ x: -1, y: -1 });
		}
	}
}
