import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		rollupOptions: {
			output: {
				/* Package phaser in a chunk named phaser */
				manualChunks: {
					phaser: [ 'phaser' ],
				},
			},
		},
	},
	base: './', // Use relative paths in index.html, makes our app relocatable.
});
