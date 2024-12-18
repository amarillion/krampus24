import './components.define.js';
import lynxUrl from './assets/lynx.gif?url';

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
	#board = null;
	#mixButton = null;

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._mixPieces = this._mixPieces.bind(this);
	}

	connectedCallback() {
		this.shadowRoot.appendChild(template.content.cloneNode(true));
		this.#board = this.shadowRoot.querySelector('#board');
		this.#mixButton = this.shadowRoot.querySelector('#mix-button');
		this.#mixButton.addEventListener('click', this._mixPieces);

		const { piecesX, piecesY } = PIECES;
		Object.assign(this.#board, { src: lynxUrl, piecesX, piecesY });
		range(piecesX * piecesY).forEach(() => {
			this.#board.appendChild(templatePiece.content.cloneNode(true));
		});
	}

	_mixPieces() {
		const { clientHeight, clientWidth, canvasWidth, canvasHeight } = this.#board;
		filter(inDefaultSlot, this.#board.children)
			.forEach(moveRandomly({ ...PIECES, clientHeight, clientWidth, canvasWidth, canvasHeight }));
	}

	_redrawBoard() {
		// Aaand we ran out of time right here...
		this.#board.innerHTML = '';
	}
}

function inDefaultSlot({ slot }) {
	return !slot;
}

function moveRandomly({ piecesX, piecesY, clientHeight, clientWidth, canvasWidth, canvasHeight }) {
	const pieceWidth = canvasWidth / piecesX;
	const pieceHeight = canvasHeight / piecesY;
	const maxOffsetX = clientWidth - pieceWidth;
	const maxOffsetY = clientHeight - pieceHeight;
	const offsetOf = ({ index }) => {
		const column = index % piecesX;
		const row = Math.floor(index / piecesX);
		const offsetX = column * pieceWidth;
		const offsetY = row * pieceHeight;
		return { offsetX, offsetY };
	};
	return (moveableGroup, index) => {
		const { offsetX, offsetY } = offsetOf({ index });
		const randomX = Math.floor(Math.random() * maxOffsetX);
		const randomY = Math.floor(Math.random() * maxOffsetY);
		moveableGroup.offsetX = randomX - offsetX;
		moveableGroup.offsetY = randomY - offsetY;
	};
}

function range(length) {
	return [...Array(length).keys()];
}

/** Used as: https://ramdajs.com/docs/#filter */
function filter(predicate, iterable) {
	const result = [];
	for (const element of iterable) {
		if (predicate(element)) {
			result.push(element);
		}
	}
	return result;
}

customElements.define('hack-jigsaw-board', HackJigsawBoard);
