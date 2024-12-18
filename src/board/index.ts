import './moveable-group.js';
import './puzzle-board.js';
import './puzzle-piece.js';
import { applyLocation, reflectLocation } from './puzzle-state.js';

export function setup({ playground, params }) {
	const seed = params.seed || Date.now();
	params.seed = seed;

	const src = params.src || 'assets/crafty-bot-512x512.jpg';
	const piecesX = parseInt(params.piecesX) || 5;
	const piecesY = parseInt(params.piecesY) || 5;

	playground.innerHTML = /* html */`
		<link rel="stylesheet" href="snippets/04-puzzle/index.css">
		<div class="puzzle-container">
			<puzzle-board>
				${range(piecesX * piecesY).map(() => /* html */`
					<moveable-group>
						<puzzle-piece></puzzle-piece>
					</moveable-group>
				`).join('')}
			</puzzle-board>
		</div>
	`;

	const board = playground.querySelector('puzzle-board');
	Object.assign(board, { src, piecesX, piecesY, seed });

	board.addEventListener('src-changed', ({ target }) => params.src = target.src);

	applyLocation({ board, params });
	window.onpopstate = () => applyLocation({ board, params });
	board.addEventListener('move-end', reflectLocation({ board, params }));

}

function range(length: number) {
	return [...Array(length).keys()];
}
