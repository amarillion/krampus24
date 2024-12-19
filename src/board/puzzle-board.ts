import { provide } from './core.js';
import { findIndex, includesElementDeep } from './utils';
import { cutoutIdOf, JigsawCutout, toSvg } from './jigsaw-cutout.js';
import { notNull } from '../util/assert.js';

const template = document.createElement('template');
template.innerHTML = /* html */`
<style>
	:host {
		position: relative;
		box-sizing: border-box;
		display: grid;
		grid-template: 'host';
		aspect-ratio: var(--puzzle-board-aspect-ratio, 1);
		object-fit: contain;
		width: 100%;
		height: 100%;
		max-width: 100%;
		max-height: 100%;
		overflow: hidden;
	}
	::slotted(*) {
		grid-area: container;
	}

	#content {
		display: grid;
		grid-area: host;
		grid-template: 'container';
		width: 800px; /* TODO adjust */
		height: 800px; /* TODO adjust */
	}

	#canvas {
		grid-area: host;
		max-height: 100%;
		aspect-ratio: inherit;
		overflow: hidden;
		box-sizing: border-box;
		position: relative;
	}
</style>
<div id="canvas"></div>
<div id="content">
	<slot></slot>
</div>
<slot name="cutout"></slot>
`;

class PuzzleBoard extends HTMLElement {

	private _src: string;
	private _canvasElement: HTMLCanvasElement;
	private _contentElement: HTMLElement;
	private _cutoutDefs: HTMLElement;
	private _canvasObserver: ResizeObserver;
	
	constructor() {
		super();
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.appendChild(template.content.cloneNode(true));
		this._src = '';
		this._canvasElement = notNull(shadowRoot.querySelector('#canvas'));
		this._contentElement = notNull(shadowRoot.querySelector('#content'));
		this._cutoutDefs = shadowRoot.querySelector('#cutout-defs');
		this._updateContentSize = this._updateContentSize.bind(this);
		this._canvasObserver = new ResizeObserver(this._updateContentSize);

		provide('board', apiOf(this), this);
	}

	connectedCallback() {
		this.src = notNull(this.getAttribute('src'));
		this._initBoard();
		this._updateContentSize();
		this._canvasObserver.observe(this._canvasElement);
	}

	disconnectedCallback() {
		this._canvasObserver.disconnect();
	}

	get canvasWidth() {
		return this._contentElement.clientWidth;
	}
	get canvasHeight() {
		return this._contentElement.clientHeight;
	}

	get piecesX() {
		return parseInt(this.getAttribute('pieces-x') || '') || 5;
	}
	set piecesX(value) {
		if (value === this.piecesX) { return; }
		this.setAttribute('pieces-x', `${value}`);
		this._initBoard();
	}

	get piecesY() {
		return parseInt(this.getAttribute('pieces-y') || '') || 5;
	}
	set piecesY(value) {
		if (value === this.piecesY) { return; }
		this.setAttribute('pieces-y', `${value}`);
		this._initBoard();
	}

	get seed() {
		return parseInt(this.getAttribute('pieces-y') || '') || 5;
	}
	set seed(value) {
		if (value === this.seed) { return; }
		this.setAttribute('seed', `${value}`);
		this._initBoard();
	}

	_initBoard() {
		const cutout = this.querySelector('[slot="cutout"]');
		if (cutout) { cutout.remove(); }
		this.innerHTML = `${this.innerHTML}\n${toSvg(JigsawCutout(this))}`
	}

	get src() {
		return this._src;
	}
	set src(value) {
		this._src = value;
		this.dispatchEvent(new Event('src-changed', { bubbles: true, composed: true }));
		if (!this._src) { return; }
		loadImage(this).then(({ width, height }) => {
			this.style.setProperty('--puzzle-board-aspect-ratio', `${width} / ${height}`);
		})
	}
	_updateContentSize() {
		const { clientWidth, clientHeight } = this._canvasElement;
		this._contentElement.style.width = `${clientWidth}px`;
		this._contentElement.style.height = `${clientHeight}px`;
	}
}

function apiOf(board) {
	return {
		get src() { return board.src; },
		addEventListener: board.addEventListener.bind(board),
		removeEventListener: board.removeEventListener.bind(board),
		resolve(piece) {
			const index = findIndex(includesElementDeep(piece), board.querySelectorAll(':scope > :not([slot])'));
			const cutoutId = cutoutIdOf(index);
			const cutout = board.querySelector(`#${cutoutId}`);
			const x = parseInt(cutout.getAttribute('data-x'));
			const y = parseInt(cutout.getAttribute('data-y'));
			return { cutoutId, x, y };
		}
	};
}

function loadImage({ src }: { src: string }) {
	return new Promise(resolve => {
		const img = document.createElement('img');
		img.setAttribute('rel', 'preload');
		img.src = src;
		img.onload = () => resolve(img);
	});
}

customElements.define('puzzle-board', PuzzleBoard);
