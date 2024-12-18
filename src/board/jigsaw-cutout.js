import { randomThunk } from './random.js';
import { always, pipe } from './utils.js';

/* The gold standard horizontal left to right edge used as a basis */
const STANDARD_EDGE = [
	curveOf(0.2, 0.1, 0.42, 0.07, 0.42, 0),
	curveOf(0, -0.07, -0.14, -0.15, 0.08, -0.15),
	curveOf(0.22, 0, 0.07, 0.08, 0.07, 0.15),
	curveOf(0, 0.075, 0.2, -0.1, 0.43, 0),
];

export function JigsawCutout({ piecesX = 5, piecesY = 5, seed = 'apple' } = {}) {
	const random = randomThunk({ seed });
	const randomly = fn => (value, ...args) => random() < 0.5 ? fn(value, ...args) : value;
	const createEdge = pipe(
		always(STANDARD_EDGE),
		randomly(rotateCurveStart),
		randomly(rotateCurveEnd),
		randomly(flipDimple),
		moveKeyPoints({ random }),
	);
	const pieces = coordinatesOf({ piecesX, piecesY })
		.map(createPiece({ createEdge }))
		.map(flipEvenColumnsHorizontal)
		.map(flipEvenRowsVertical)
		.map(alignEdgesToNeighbor)
		.map(cutFirstRowTop)
		.map(cutFirstColumnLeft)
		.map(cutLastColumnRight({ piecesX }))
		.map(cutLastRowBottom({ piecesY }))
		.map(scaleToBoard({ piecesX, piecesY }))
		;
	return { piecesX, piecesY, pieces };
}

function coordinatesOf({ piecesX, piecesY }) {
	const pieces = [];
	for(let y = 0; y < piecesY; y++) {
		for(let x = 0; x < piecesX; x++) {
			pieces.push({ x, y });
		}
	}
	return pieces;
}

function createPiece({ createEdge }) {
	return coordinates => {
		const top = createEdge();
		const right = createEdge().map(rotateCurve90);
		const bottom = createEdge().map(rotateCurve90).map(rotateCurve90);
		const left = createEdge().map(rotateCurve90).map(rotateCurve90).map(rotateCurve90);
		const edges = [top, right, bottom, left];
		return { ...coordinates, moveArgs: [0, 0], edges };
	}
}

export function rotateCurve90({ args, ...rest }) {
	const [y1, x1, y2, x2, y, x] = args;
	return { ...rest, args: [-x1, y1, -x2, y2, -x, y] };
}

function flipCommand({ args, ...rest }) {
	return { ...rest, args: args.map(nr => -nr) };
}

function flipEvenColumnsHorizontal(piece) {
	if (piece.x % 2 === 0) { return piece; }
	const { moveArgs, edges } = piece;
	const [/* moveX */, moveY] = moveArgs;
	const [top, right, bottom, left] = edges;
	const topFlipped = top.map(flipCommand);
	const bottomFlipped = bottom.map(flipCommand);
	return { ...piece, moveArgs: [1, moveY], edges: [topFlipped, right, bottomFlipped, left] };
}

function flipEvenRowsVertical(piece) {
	if (piece.y % 2 === 0) { return piece; }
	const { moveArgs, edges } = piece;
	const [moveX] = moveArgs;
	const [top, right, bottom, left] = edges;
	const rightFlipped = right.map(flipCommand);
	const leftFlipped = left.map(flipCommand);
	return { ...piece, moveArgs: [moveX, 1], edges: [top, rightFlipped, bottom, leftFlipped] };
}

/**
 * Randomly scatter the three main points of an edge: the dimple center and the point next to it.
 * Assumes 4 curve commands: curve -> half dimple -> half dimple -> curve */
function moveKeyPoints({ random }) {
	return ([
		{ command: c1, args: [c1X1, c1Y1, c1X2, c1Y2, c1X, c1Y] },
		{ command: c2, args: [c2X1, c2Y1, c2X2, c2Y2, c2X, c2Y] },
		{ command: c3, args: [c3X1, c3Y1, c3X2, c3Y2, c3X, c3Y] },
		{ command: c4, args: [c4X1, c4Y1, c4X2, c4Y2, c4X, c4Y] },
	]) => {
		const { x: x1, y: y1 } = randomPoint({ random, radius: 0.04 });
		const { x: x2, y: y2 } = randomPoint({ random, radius: 0.04 });
		const { x: dx3, y: dy3 } = randomPoint({ random, radius: 0.01 });
		const x3 = x1 + dx3;
		const y3 = y1 + dy3;
		const asPrecise = nr => asPreciseNumber(nr);
		return [
			{ command: c1, args: [c1X1, c1Y1, c1X2 + x1, c1Y2 + y1, c1X + x1, c1Y + y1].map(asPrecise) },
			{ command: c2, args: [c2X1, c2Y1, c2X2 + x2, c2Y2 - y1 + y2, c2X - x1 + x2, c2Y - y1 + y2].map(asPrecise) },
			{ command: c3, args: [c3X1, c3Y1, c3X2 - x2 + x3, c3Y2 - y2 + y3, c3X - x2 + x3, c3Y - y2 + y3].map(asPrecise) },
			{ command: c4, args: [c4X1, c4Y1, c4X2 - x3, c4Y2 - y3, c4X - x3, c4Y - y3].map(asPrecise) },
		]
	};
}

function randomPoint({ random, radius = 0.05 }) {
	const r = radius * Math.sqrt(random());
	const theta = random() * 2 * Math.PI;
	const x = asPreciseNumber(r * Math.cos(theta));
	const y = asPreciseNumber(r * Math.sin(theta));
	return { x, y };
}

/**
 * Flip the curve handle before the dimple between horizontal and vertical orientation
 * Assumes 4 curve commands: curve -> half dimple -> half dimple -> curve */
export function rotateCurveStart([p1, p2, p3, p4]) {
	const [rp1, rp2] = rotateCurvePortion({ commands: [p1, p2] });
	return [rp1, rp2, p3, p4];
}

/**
 * Flip the curve handle before the dimple between horizontal and vertical orientation
 * Assumes 4 curve commands: curve -> half dimple -> half dimple -> curve */
export function rotateCurveEnd([p1, p2, p3, p4]) {
	const [rp3, rp4] = rotateCurvePortion({ commands: [p3, p4], isEnd: true });
	return [p1, p2, rp3, rp4];
}

/**
 * Flip the curve handle before the dimple between horizontal and vertical orientation
 * Assumes 4 curve commands: curve -> half dimple -> half dimple -> curve */
export function rotateCurvePortion({ commands, isEnd = false }) {
	const [
		{ command: c1, args: [c1X1, c1Y1, c1X2, c1Y2, c1X, c1Y] },
		{ command: c2, args: [/**/, c2Y1, c2X2, c2Y2, c2X, c2Y] },
	] = commands;
	const length1 = c1Y - c1Y2;
	const length2 = c2Y1;
	const direction = isEnd ? 1 : -1;
	return [
		{ command: c1, args: [c1X1, c1Y1, asPreciseNumber(c1X2 - direction * length1), c1Y, c1X, c1Y] },
		{ command: c2, args: [direction * length2, 0, c2X2, c2Y2, c2X, c2Y] },
	];
}

/** Randomize if a dimple sticks or gets cut out */
function flipDimple(edge, { edgeIsVertical = false } = {}) {
	const shouldFlip = edgeIsVertical ? isCoordinateX : isCoordinateY;
	const isBeforeDimple = (commandIndex, argIndex) => commandIndex === 0 && argIndex < 2;
	const isAfterDimple = (commandIndex, argIndex) => commandIndex === 3 && 1 < argIndex;
	return edge.map((command, commandIndex) => {
		const flippedArgs = command.args.map((nr, argIndex) => {
			const ignore = !shouldFlip(argIndex) ||
				isBeforeDimple(commandIndex, argIndex) ||
				isAfterDimple(commandIndex, argIndex);
			return ignore ? nr : -nr;
		});
		return { ...command, args: flippedArgs };
	});
}

function alignEdgesToNeighbor(piece, _, pieces) {
	const leftNeighbor = pieces.find(({ x, y }) => x === piece.x - 1 && y === piece.y);
	const topNeighbor = pieces.find(({ x, y }) => x === piece.x && y === piece.y - 1);
	const pieceAlignedLeft = leftNeighbor ? copyRightEdge({ from: leftNeighbor, to: piece }) : piece;
	return topNeighbor ? copyBottomEdge({ from: topNeighbor, to: pieceAlignedLeft }) : pieceAlignedLeft;
}

function copyRightEdge({ from, to }) {
	const index = from.x % 2 === 0 ? 1 : 3;
	return copyEdge({ from, to, index });
}

function copyBottomEdge({ from, to }) {
	const index = from.y % 2 === 0 ? 2 : 0;
	return copyEdge({ from, to, index });
}

function copyEdge({ from: { edges }, to, index }) {
	const newEdges = [...to.edges];
	newEdges[index] = edges[index];
	return { ...to, edges: newEdges };
}

function cutFirstRowTop(piece) {
	const { x, y, edges } = piece;
	if (0 < y) { return piece; }
	const [/**/, ...rest] = edges;
	const direction = x % 2 === 0 ? 1 : -1;
	const line = [lineOf(direction, 0)];
	return { ...piece, edges: [line, ...rest] };
}

function cutFirstColumnLeft(piece) {
	const { x, y, edges } = piece;
	if (0 < x) { return piece; }
	const [first, second, third] = edges;
	const direction = y % 2 === 0 ? 1 : -1;
	const line = [lineOf(0, -direction)];
	return { ...piece, edges: [first, second, third, line] };
}

function cutLastColumnRight({ piecesX }) {
	return piece => {
		const { x, y, edges } = piece;
		if (x < piecesX - 1) { return piece; }
		const [first, second, third, fourth] = edges;
		const direction = y % 2 === 0 ? 1 : -1;
		if (x % 2 === 0) {
			const line = [lineOf(0, direction)];
			return { ...piece, edges: [first, line, third, fourth] }
		}
		const line = [lineOf(0, -direction)];
		return { ...piece, edges: [first, second, third, line] };
	}
}

function cutLastRowBottom({ piecesY }) {
	return piece => {
		const { x, y, edges } = piece;
		if (y < piecesY - 1) { return piece; }
		const [first, second, third, fourth] = edges;
		const direction = x % 2 === 0 ? 1 : -1;
		if (y % 2 === 0) {
			const line = [lineOf(-direction, 0)];
			return { ...piece, edges: [first, second, line, fourth] }
		}
		const line = [lineOf(direction, 0)];
		return { ...piece, edges: [line, second, third, fourth] };
	}
}

function scaleToBoard({ piecesX, piecesY }) {
	return ({ x, y, moveArgs, edges, ...rest }) => {
		const scaleX = 1 / piecesX;
		const scaleY = 1 / piecesY;

		const [moveX, moveY] = moveArgs;
		const moveArgsScaled = [(x + moveX) * scaleX, (y + moveY) * scaleY];

		const scaleArg = (value, index) => index % 2 === 0 ? value * scaleX : value * scaleY;
		const scaleCommand = ({ args, ...rest }) => ({ ...rest, args: args.map(scaleArg) });
		const edgesScaled = edges.map(commands => commands.map(scaleCommand))
		return { x, y, ...rest, moveArgs: moveArgsScaled, edges: edgesScaled };
	}
}

function isCoordinateX(index) {
	return index % 2 === 0;
}

function isCoordinateY(index) {
	return !isCoordinateX(index);
}

function lineOf(deltaX, deltaY) {
	return Path({ command: 'l', args: [deltaX, deltaY] });
}

export function curveOf(x1, y1, x2, y2, toX, toY) {
	return Path({ command: 'c', args: [x1, y1, x2, y2, toX, toY] })
}

function Path({ command, args = [] }) {
	return { command, args };
}

export function cutoutIdOf(index) {
	return `piece-${index + 1}`;
}

export function toSvg({ pieces }) {
	const clipPaths = pieces.map(toClipPath).join('\n');
	return /* svg */`
		<svg slot="cutout" width="0" height="0" viewBox="0 0 1 1">
			<defs>
				${clipPaths}
			</defs>
		</svg>
	`;
}

function toClipPath({ x, y, moveArgs, edges }, index) {
	const id = cutoutIdOf(index);
	const toCommand = i => `${i.command} ${i.args.join(' ')}`
	const toPath = paths => paths.map(toCommand).join(' ');
	const commands = edges.map(toPath).join(' ');
	const path = `M ${moveArgs.join(' ')} ${commands} Z`;
	return /* svg */`
		<clipPath id="${id}" clipPathUnits="objectBoundingBox" data-x="${x}" data-y="${y}"><path d="${path}" /></clipPath>
	`;
}

function asPreciseNumber(nr, precision = 5) {
	return Number(nr.toPrecision(precision));
}
