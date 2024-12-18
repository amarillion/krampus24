import { getImageUrl } from './imageUrl.js';
import { assert } from './util/assert.js';
import { type PuzzleBoard } from './board/puzzle-board.js';
import { type MoveableGroup } from './board/moveable-group.js';

const PIECES = { piecesX: 5, piecesY: 4 };

const template = document.createElement('template');
template.innerHTML = /* html */`
<style>
	:host {
		box-sizing: border-box;
		display: block;
		width: 100%;
		height: 100%;
		position: relative;
	}
	.puzzle-container {
		width: 100%;
		height: 100%;
	}
	#mix-button {
		position: absolute;
		right: 16px;
		bottom: 16px;
	}
</style>
<div class="puzzle-container">
	<puzzle-board id="board"></puzzle-board>
</div>
<jigsaw-ds-button id="mix-button" variant="primary">Scatter pieces</jigsaw-ds-button>
`;

const templatePiece = document.createElement('template');
templatePiece.innerHTML = /* html */`
<moveable-group>
	<puzzle-piece></puzzle-piece>
</moveable-group>
`;

export class HackJigsawBoard extends HTMLElement {
	#board: PuzzleBoard|null = null;
	#mixButton: HTMLElement|null = null;
	#shadowRoot: ShadowRoot; // initialization guaranteed

	constructor() {
		super();
		this.#shadowRoot = this.attachShadow({ mode: 'open' });
		this._mixPieces = this._mixPieces.bind(this);
	}

	async connectedCallback() {
		this.#shadowRoot.appendChild(template.content.cloneNode(true));
		this.#board = this.#shadowRoot.querySelector('#board');
		assert(this.#board);
		this.#mixButton = this.#shadowRoot.querySelector('#mix-button');
		assert(this.#mixButton);
		this.#mixButton.addEventListener('click', this._mixPieces);

		const { piecesX, piecesY } = PIECES;
		const src = await getImageUrl();
		Object.assign(this.#board, { src, piecesX, piecesY });
		range(piecesX * piecesY).forEach(() => {
			assert(this.#board);
			this.#board.appendChild(templatePiece.content.cloneNode(true));
		});
	}

	_mixPieces() {
		assert(this.#board);
		const { clientHeight, clientWidth, canvasWidth, canvasHeight } = this.#board;
		filter(inDefaultSlot, this.#board.children)
			.forEach(moveRandomly({ ...PIECES, clientHeight, clientWidth, canvasWidth, canvasHeight }));
	}

}

function inDefaultSlot({ slot }: { slot?: unknown }) {
	return !slot;
}

function moveRandomly({ piecesX, piecesY, clientHeight, clientWidth, canvasWidth, canvasHeight } : {
	piecesX: number, piecesY: number, clientHeight: number, clientWidth: number, canvasWidth: number, canvasHeight: number
}) {
	const pieceWidth = canvasWidth / piecesX;
	const pieceHeight = canvasHeight / piecesY;
	const maxOffsetX = clientWidth - pieceWidth;
	const maxOffsetY = clientHeight - pieceHeight;
	const offsetOf = ({ index }: { index: number }) => {
		const column = index % piecesX;
		const row = Math.floor(index / piecesX);
		const offsetX = column * pieceWidth;
		const offsetY = row * pieceHeight;
		return { offsetX, offsetY };
	};
	return (moveableGroup: MoveableGroup, index: number) => {
		const { offsetX, offsetY } = offsetOf({ index });
		const randomX = Math.floor(Math.random() * maxOffsetX);
		const randomY = Math.floor(Math.random() * maxOffsetY);
		moveableGroup.offsetX = randomX - offsetX;
		moveableGroup.offsetY = randomY - offsetY;
	};
}

function range(length: number) {
	return [...Array(length).keys()];
}

/** Used as: https://ramdajs.com/docs/#filter */
function filter<T>(predicate: (n: T) => boolean, iterable: Iterable<T>) {
	const result = [];
	for (const element of iterable) {
		if (predicate(element)) {
			result.push(element);
		}
	}
	return result;
}

customElements.define('hack-jigsaw-board', HackJigsawBoard);
