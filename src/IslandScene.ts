import Phaser from 'phaser';
import { Point } from './util/geom/point';
import { randomInt, randomIntBetween } from './util/random';

type Particle = {
	p: Point,
	v: Point,
};

export class IslandScene {

	scene: Phaser.Scene;
	texture: Phaser.Textures.DynamicTexture;
	particles: Particle[] = [];

	constructor(scene: Phaser.Scene, texture: Phaser.Textures.DynamicTexture) {
		this.scene = scene;
		this.texture = texture;
	}

	init() {
		for (let i = 0; i < 64; i++) {
			this.particles.push({
				p: new Point(randomInt(this.texture.width), randomInt(this.texture.height)),
				v: new Point(randomIntBetween(-3, 3), randomIntBetween(-3, 3)),
			});
		}
	}

	update() {
		const texture = this.texture;

		texture.beginDraw();
		const texSize = new Point(texture.width, texture.height);

		texture.batchDraw('island', 0, 0);

		for (const sprite of this.particles) {
			sprite.p = sprite.p.plus(sprite.v).wrap(texSize);

			// batchDrawing to vastly improve performance
			// btw: https://phaser.io/news/2024/10/phaser-beam-technical-preview-5
			texture.batchDraw('mushroom', sprite.p.x, sprite.p.y);
			
			const edge = 512 - 64;
			// duplicate on edges...
			if (sprite.p.x > edge) {
				texture.batchDraw('mushroom', sprite.p.x - texSize.x, sprite.p.y);
			}
			if (sprite.p.y > edge) {
				texture.batchDraw('mushroom', sprite.p.x, sprite.p.y - texSize.y);
			}
			if (sprite.p.x > edge && sprite.p.y > edge) {
				texture.batchDraw('mushroom', sprite.p.x - texSize.x, sprite.p.y - texSize.y);
			}
		}
		texture.endDraw();
	}
}
