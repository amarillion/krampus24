import Phaser from 'phaser';
import { MenuComponent } from '../components/menuComponent.js';
import { randomInt } from '../util/random.js';

// TODO: move whole module to phaser utilities

/*
	Adds an event listener on a DOM element, and returns a function that
	removes it again when called.
*/
// TODO: move to utility module
export function registerEventListener(
	elt: HTMLElement, type: string, func: EventListenerOrEventListenerObject, capture = false
) {
	elt.addEventListener(type, func, capture);
	return () => {
		elt.removeEventListener(type, func, capture);
	};
}

let _key: string;
function registerOnce(componentClass: CustomElementConstructor) {
	if (!_key) {
		// give the key random scope bits
		_key = `scene-component-${randomInt(Number.MAX_SAFE_INTEGER)}`;
		customElements.define(_key, componentClass);
	}
	return _key;
}

export class WebComponentScene extends Phaser.Scene {

	constructor({ key, next }: { key: string, next: string }) {
		super({ key });
		this.next = next;
	}

	component: MenuComponent | undefined = undefined;
	unregister: (() => void)[] = [];
	next: string;

	async create() {
		const gameCanvasElt = this.game.canvas;
		gameCanvasElt.setAttribute('style', 'display: none;');
		
		// only first time it needs to be registered...
		const elementKey = registerOnce(MenuComponent);
		this.component = document.createElement(elementKey) as MenuComponent;
		this.component.setAttribute('style', 'display: visible;');
		document.body.appendChild(this.component);

		this.unregister = [
			registerEventListener(this.component, 'Start', () => this.startGame()),
		];

		this.events.on('shutdown', () => this.shutdown());
	}

	startGame() {
		this.scene.start(this.next);
	}

	shutdown() {
		this.unregister.forEach(f => f());
		this.component?.setAttribute('style', 'display: none;');
		const gameCanvasElt = this.game.canvas;
		gameCanvasElt.setAttribute('style', 'display: visible;');
	}
}
