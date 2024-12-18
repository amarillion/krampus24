import { inject } from './core.js';

const template = document.createElement('template');
template.innerHTML = /* html */`
<style>
	:host {
		box-sizing: border-box;
		display: block;
		width: 100%;
		height: 100%;
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
	}
</style>
<style id="cutout"></style>
`;

class PuzzlePiece extends HTMLElement {
	constructor() {
		super();
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.appendChild(template.content.cloneNode(true));
		this._board = inject('board', this);

		this._cutoutStyleElement = shadowRoot.querySelector('#cutout');
		this._applyCutout = this._applyCutout.bind(this);

		this._board?.addEventListener('src-changed', this._applyCutout);
	}

	connectedCallback() {
		this._applyCutout();
	}

	get x() { return this._coordinates.x; }
	get y() { return this._coordinates.y; }

	_applyCutout() {
		if (!this._board.src) { return; }
		const { cutoutId, x, y } = this._board.resolve(this);
		this._coordinates = { x, y };
		this._cutoutStyleElement.innerHTML = `
			:host {
				clip-path: url('#${cutoutId}');
				background-image: url('${this._board.src}');
			}
		`;
	}
}

customElements.define('puzzle-piece', PuzzlePiece);
