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

				// URL relative to manifest file
				start_url: './',

				display: 'standalone',
				background_color: '#ffffbb',
				theme_color: '#7744ff',
				icons: [ {
					// relative to manifest file
					src: './logo192.png',
					sizes: '192x192',
					type: 'image/png',
				}, {
					// relative to manifest file
					src: './logo512.png',
					sizes: '512x512',
					type: 'image/png',
				} ],
			},
		}),
	],
});
