/* eslint-disable camelcase */
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

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
	plugins: [
		VitePWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'KrampusHack 2024',
				short_name: 'krampus24',

				// start_url configured for github pages: https://amarillion.github.io/krampus24/
				start_url: '/krampus24/',

				display: 'standalone',
				background_color: '#ffffbb',
				theme_color: '#7744ff',
				icons: [ {
					src: '/logo192.png',
					sizes: '192x192',
					type: 'image/png',
				}, {
					src: '/logo512.png',
					sizes: '512x512',
					type: 'image/png',
				} ],
			},
		}),
	],
});
