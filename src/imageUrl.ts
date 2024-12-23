import { IslandMap } from './islandMap.js';
import paletteUrl from './assets/island-palette.png?url';
import { assert } from './util/assert.js';
// import lynxUrl from './assets/lynx.gif?url';

export async function getImageUrl() {

	const islandMap = new IslandMap({ width: 800, height: 800, paletteUrl });
	const imageData = islandMap.generate();
	
	// Draw image data to the canvas
	
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	canvas.width = (await imageData).width;
	canvas.height = (await imageData).height;
	assert(ctx);
	ctx.putImageData(await imageData, 0, 0);

	const promise = new Promise<Blob | null>(resolve => {
		canvas.toBlob(resolve);
	});

	const blob = await promise;
	assert(blob);
	return URL.createObjectURL(blob);
	// TODO: also call revokeObjectURL...
}
