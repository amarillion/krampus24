const template = document.createElement('template');
template.innerHTML = /* html */`
<style>
	:host {
		box-sizing: border-box;
		display: block;
		pointer-events: none;
	}

	::slotted(*) {
		pointer-events: all;
	}

	:host(:hover) {
		z-index: var(--z-topmost);
	}
	@media (hover: hover) {
		:host(:hover) {
			filter: brightness(165%);
		}
	}
</style>
<slot></slot>
`;

function onGlobalMouseMove(event) {
	event.preventDefault();
	if (!State.activePiece) { return; }
	State.activePiece._moveUpdate(event);
	if (!event.buttons) {
		State.activePiece._moveEnd(event);
	}
}

function onGlobalMouseUp(event) {
	if (!State.activePiece) { return; }
	State.activePiece._moveEnd(event);
}

const State = {
	activePiece: null,
};

class MoveableGroup extends HTMLElement {
	constructor() {
		super();
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.appendChild(template.content.cloneNode(true));

		this._offsetX = 0;
		this._offsetY = 0;

		this._updateLocation = this._updateLocation.bind(this);
		this._snapLocation = this._snapLocation.bind(this);
		this._moveStart = this._moveStart.bind(this);
		this._moveUpdate = this._moveUpdate.bind(this);
		this._moveEnd = this._moveEnd.bind(this);

		this.addEventListener('mousedown', this._moveStart);
		window.addEventListener('mousemove', onGlobalMouseMove);
		this.addEventListener('mouseup', onGlobalMouseUp);

		this.addEventListener('touchstart', ({ touches }) => this._moveStart(touches[0]));
		this.addEventListener('touchmove', ({ touches }) => this._moveUpdate(touches[0]));
		this.addEventListener('touchend', ({ touches }) => this._moveEnd(touches[0]));
		this.addEventListener('touchcancel', ({ touches }) => this._moveEnd(touches[0]));
	}

	get offsetX() {
		return this._offsetX;
	}

	set offsetX(value) {
		this._offsetX = value;
		this._updateLocation();
	}

	get offsetY() {
		return this._offsetY;
	}

	set offsetY(value) {
		this._offsetY = value;
		this._updateLocation();
	}

	_moveStart({ screenX, screenY }) {
		State.activePiece = this;
		this._moveActive = {
			screenX: screenX - this.offsetX,
			screenY: screenY - this.offsetY,
		};
		this.style.zIndex = 999;
	}

	_moveUpdate({ screenX, screenY }) {
		if (State.activePiece !== this || !this._moveActive) { return; }
		this._offsetX = screenX - this._moveActive.screenX;
		this._offsetY = screenY - this._moveActive.screenY;
		this._updateLocation();
	}

	_moveEnd() {
		State.activePiece = null;
		this._moveActive = null;
		this.style.zIndex = null;
		this._snapLocation();
		this.dispatchEvent(new Event('move-end', { bubbles: true, composed: true }));
	}

	_updateLocation() {
		this.style.transform = `translate(${this._offsetX}px, ${this._offsetY}px)`;
	}

	_snapLocation() {
		this.offsetX = Math.round(this.offsetX / 24) * 24;
		this.offsetY = Math.round(this.offsetY / 24) * 24;
	}
}

customElements.define('moveable-group', MoveableGroup);
