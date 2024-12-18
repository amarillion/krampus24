import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { assert } from './util/assert.js';
import { Vec3 } from './util/geom/vec3.js';
import { Point } from './util/geom/point.js';
import { clamp } from './util/math.js';
import { pointRange } from './util/geom/pointRange.js';

/*

Create an island map

1. Generate image data...

1. Use 2D perlin noise

2. Convert to color gradient

3. Add iso lines

4. Add shadows

5. Add decorations...

 */

export type ConfigType = {
	width: number;
	height: number;
	paletteUrl: string;
};

export class IslandMap {

	config: ConfigType;
	noise2D: NoiseFunction2D;
	palettePromise: Promise<ImageData>;
	lightSource = Vec3.normalize({ x: 0.5, y: 0.8, z: -0.3 });

	constructor(config: ConfigType) {
		this.config = config;

		// initialize the noise function
		this.noise2D = createNoise2D();

		this.palettePromise = this.loadPalette();
	}

	async loadPalette() {
		const img = new Image();
		img.src = this.config.paletteUrl;
		return new Promise<ImageData>((resolve, reject) => {
			img.onload = () => {
				const canvas = document.createElement('canvas');  
				const context = canvas.getContext("2d");
				if (context) {
					context.drawImage(img, 0, 0, img.width, img.height);
					const imgData = context.getImageData(0, 0, img.width, img.height);
					resolve(imgData);
				}
				else {
					reject(`Can't create context`);
				}
			};
		});	
	}

	// return value between 0 and 1.
	getHeight(x: number, y : number) {
		const { width, height } = this.config;

		// two levels of fractal noise
		const val2 = this.noise2D(x / 400, y / 400);
		const val1 = this.noise2D(x / 200, y / 200);
		const val0 = this.noise2D(x / 100, y / 100);

		let h = 0.5 + 0.5 * (val2 + 0.5 * val1 * 0.3 + val0 * 0.2);

		// distance to center
		const delta = new Point(width, height).minus({ x, y });
		let dist = delta.length() / Point.length({x: width / 2, y: height / 2 });
		
		return clamp(h - dist, 0.0, 1.0);
	}

	async generate() {
		const { width, height } = this.config;

		const palette = await this.palettePromise;

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		assert(ctx);
		const imageData = ctx.createImageData(width, height);

		for (const { x, y } of pointRange(width, height)) {

			let idx = ((y * width) + x) * 4;

			const h = this.getHeight(x, y);

			// calculate shadow
			let light = 0.85;
			// if (h > 0.148) {
			if (h > 0) {
				let dx = h - this.getHeight(x - 1, y);
				let dy = h - this.getHeight(x, y - 1);

				const angle = Vec3.dot_product(Vec3.normalize({ x: dx, y: dy, z: 0.01 }), this.lightSource);
				light = Math.cos(angle);
			}

			// map value to palette...
			const pal = Math.floor(h * (palette.width - 1)) * 4;

			imageData.data[idx + 0] = light * palette.data[pal + 0]; // R value
			imageData.data[idx + 1] = light * palette.data[pal + 1]; // G value
			imageData.data[idx + 2] = light * palette.data[pal + 2]; // B value
			imageData.data[idx + 3] = 255; // A value
		}
		return imageData;
	}

}