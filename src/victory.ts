import Phaser from 'phaser';
import { Point } from './util/geom/point';
import { randomInt } from './util/random';

type Particle = {
	p: Point,
	v: Point,
	sprite: Phaser.GameObjects.Sprite,
};

export class Victory {

	scene: Phaser.Scene;
	particles: Particle[] = [];
	size: Point = new Point(0, 0);

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
	}

	init() {
		const { width, height } = this.scene.sys.game.canvas;
		this.size = new Point(width, height);

		for (let i = 0; i < 20; i++) {
			const p = new Point(randomInt(width), randomInt(height));
			const v = new Point((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
			
			const frame = Math.abs(v.x) < Math.abs(v.y) ? ((v.y < 0) ? 15 : 13) : 11;
			const sprite = this.scene.add.sprite(p.x, p.y, 'sprites', frame);
			sprite.flipX = v.x > 0;
			
			this.particles.push({ p, v, sprite });
		}
	}

	reset() {
		for (const p of this.particles) {
			p.sprite.destroy();
		}
	}

	update() {
		for (const sprite of this.particles) {
			sprite.p = sprite.p.plus(sprite.v).wrap(this.size);
			sprite.sprite.setPosition(sprite.p.x, sprite.p.y);
		}
	}
}
