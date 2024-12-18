// import the noise functions you need
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { assert } from './util/assert';

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

type Vec3 = {
	x: number,
	y: number,
	z: number
};

function dot_product(a: Vec3, b: Vec3) {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

function vec_length(v: Vec3) {
	return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function vec_normalize(v: Vec3) {
	const len = vec_length(v);
	return {
		x: v.x / len,
		y: v.y / len,
		z: v.z / len
	};
}

export class IslandMap {

	config: ConfigType;
	noise2D: NoiseFunction2D;
	palettePromise: Promise<ImageData>;
	lightSource = vec_normalize({ x: 0.5, y: 0.8, z: -0.3 });

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
		// TODO use point class...
		let dx = ((width / 2) - x);
		let dy = ((height / 2) - y);
		let dist = Math.sqrt(dx * dx + dy * dy) / Math.sqrt((width * width / 4) + (height * height / 4));
		
		// TODO: bound utility function...
		return Math.max(0, Math.min(1.0, h - dist));
	}

	async generate() {
		const { width, height } = this.config;

		const palette = await this.palettePromise;

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		assert(ctx);
		const imageData = ctx.createImageData(width, height);

		// TODO: use eachRange
		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				let idx = ((y * width) + x) * 4;

				const h = this.getHeight(x, y);

				// calculate shadow
				let light = 0.85;
				// if (h > 0.148) {
				if (h > 0) {
					let dx = h - this.getHeight(x - 1, y);
					let dy = h - this.getHeight(x, y - 1);

					const angle = dot_product(vec_normalize({ x: dx, y:  dy, z: 0.01 }), this.lightSource);
					light = Math.cos(angle);
				}

				// map value to palette...
				const pal = Math.floor(h * (palette.width - 1)) * 4;

				imageData.data[idx + 0] = light * palette.data[pal + 0]; // R value
				imageData.data[idx + 1] = light * palette.data[pal + 1]; // G value
				imageData.data[idx + 2] = light * palette.data[pal + 2]; // B value
				imageData.data[idx + 3] = 255; // A value
			}
		}
		return imageData;
	}

}