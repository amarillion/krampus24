import { curveOf, rotateCurveStart, rotateCurveEnd, PathSegmentType } from './jigsaw-cutout';
import { test, expect } from 'vitest';

/* Has curve handles in vertical orientation on both sides of the dimple */
const EDGE_VERTICAL_VERTICAL: PathSegmentType[] = [
	curveOf(0.2, 0.1, 0.4, 0.075, 0.4, 0),
	curveOf(0, -0.075, -0.1, -0.15, 0.1, -0.15),
	curveOf(0.2, 0, 0.1, 0.075, 0.1, 0.15),
	curveOf(0, 0.075, 0.2, -0.1, 0.4, 0),
];

/* Has curve handles in horizontal orientation on both sides of the dimple */
const EDGE_HORIZONTAL_HORIZONTAL = [
	curveOf(0.2, 0.1, 0.325, 0, 0.4, 0),
	curveOf(0.075, 0, -0.1, -0.15, 0.1, -0.15),
	curveOf(0.2, 0, 0.025, 0.15, 0.1, 0.15),
	curveOf(0.075, 0, 0.2, -0.1, 0.4, 0),
];

/* Has curve handle in horizontal orientation before the dimple */
const EDGE_HORIZONTAL_VERTICAL = [
	EDGE_HORIZONTAL_HORIZONTAL[0],
	EDGE_HORIZONTAL_HORIZONTAL[1],
	EDGE_VERTICAL_VERTICAL[2],
	EDGE_VERTICAL_VERTICAL[3],
];

/* Has curve handle in horizontal orientation after the dimple */
const EDGE_VERTICAL_HORIZONTAL = [
	EDGE_VERTICAL_VERTICAL[0],
	EDGE_VERTICAL_VERTICAL[1],
	EDGE_HORIZONTAL_HORIZONTAL[2],
	EDGE_HORIZONTAL_HORIZONTAL[3],
];


test('rotateCurveStart turns vertical curve handle to horizontal', () => {
	expect(rotateCurveStart(EDGE_VERTICAL_VERTICAL)).toEqual(EDGE_HORIZONTAL_VERTICAL);
});

test('rotateCurveEnd turns vertical curve handle to horizontal', () => {
	expect(rotateCurveEnd(EDGE_VERTICAL_VERTICAL)).toEqual(EDGE_VERTICAL_HORIZONTAL);
});
