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

export class IslandMap {

	config: ConfigType;
	noise2D: NoiseFunction2D;
	palettePromise: Promise<ImageData>;
	
	constructor(config: ConfigType) {
		this.config = config;

		// initialize the noise function
		this.noise2D = createNoise2D();

		this.palettePromise = this.loadPalette();
	}

	async loadPalette() {
		const img = new Image();
		img.src = this.config.paletteUrl;
		return new Promise((resolve, reject) => {
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

	async generate() {
		const { width, height } = this.config;
		const { noise2D } = this;

		const palette = await this.palettePromise;

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		assert(ctx);
		const imageData = ctx.createImageData(width, height);

		// TODO: use eachRange
		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				let idx = ((y * width) + x) * 4;

				// two levels of fractal noise
				const val2 = noise2D(x / 400, y / 400);
				const val1 = noise2D(x / 200, y / 200);
				const val0 = noise2D(x / 100, y / 100);
				let val = 0.5 + 0.5 * (val2 + 0.6 * val1 * 0.1 + val0 * 0.3);

				// distance to center
				// TODO use point class...
				let dx = ((width / 2) - x);
				let dy = ((height / 2) - y);
				let dist = Math.sqrt(dx * dx + dy * dy) / Math.sqrt((width * width / 4) + (height * height / 4));
				
				// TODO: bound utility function...
				val = Math.max(0, Math.min(1.0, val - dist));

				// map value to palette...
				const pal = Math.floor(val * palette.width) * 4;

				imageData.data[idx + 0] = palette.data[pal + 0]; // R value
				imageData.data[idx + 1] = palette.data[pal + 1]; // G value
				imageData.data[idx + 2] = palette.data[pal + 2]; // B value
				imageData.data[idx + 3] = 255; // A value
			}
		}
		return imageData;
	}

}