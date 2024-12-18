import { indexOf } from './utils.js';

export function reflectLocation({ board, params }) {
	return ({ target }) => {
		const index = indexOf(target, board.children);
		const value = `${target.offsetX}_${target.offsetY}`;
		params[`p${index}`] = value === '0_0' ? null : value;
	};
}

export function applyLocation({ board, params }) {
	const moveables = board.querySelectorAll('moveable-group');
	for (let index = 0; index < moveables.length; index++) {
		const value = params[`p${index}`];
		if (!value) { continue; }
		const [offsetX, offsetY] = value.split('_').map(number => parseInt(number));
		Object.assign(moveables[index], { offsetX, offsetY });
	}
}
