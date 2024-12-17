import { assert } from './assert.js';

export interface IPoint {
	x: number;
	y: number;
}

export class Point implements IPoint {

	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	
	/**
	 * @param {*} degrees must be a multiple of 90. Positive: rotate left. Negative: rotate right
	 * returns a new Point()
	 */
	rotate(degrees: number) {
		return Point.rotate(this, degrees);
	}

	static rotate(p: IPoint, degrees: number) {
		const { x, y } = p;
		switch((degrees + 360) % 360) {
			case 270: return new Point(-y, x);
			case 180: return new Point(-x, -y);
			case  90: return new Point(y, -x);
			case   0: return new Point(x, y);
			default: assert(false, `Invalid value ${degrees}`);
		}
	}

	/**
		Scale the vector
		returns a new Point
 	*/
	mul(val: number) {
		return Point.mul(this, val);
	}

	static mul(p: IPoint, val: number) {
		return new Point(p.x * val, p.y * val);
	}

	/**
	 * @param {*} p point to add to this
	 * returns a new Point containing the sum 
	 */
	plus(p: IPoint) {
		return Point.plus(this, p);
	}

	static plus(a: IPoint, b: IPoint) {
		return new Point(a.x + b.x, a.y + b.y);
	}

	/* returns a new point, which you get after sustracting p from this */
	minus(p: IPoint) {
		return Point.minus(this, p);
	}

	static minus(a: IPoint, b: IPoint) {
		return new Point(a.x - b.x, a.y - b.y);
	}

	/**
	 * returns the manhattan distance from 0,0 to this point.
	 */
	manhattan() {
		return Point.manhattan(this);
	}

	static manhattan(p: IPoint) {
		return Math.abs(p.x) + Math.abs(p.y);
	}

	toString() {
		return Point.toString(this);
	}

	static toString(p: IPoint) {
		return `${p.x},${p.y}`;
	}

	equals(other: IPoint) {
		return Point.equals(this, other);
	}

	static equals(a: IPoint, b: IPoint) {
		return a.x === b.x && a.y === b.y;
	}
}
