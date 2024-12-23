import Phaser from 'phaser';

export class FpsLabel extends Phaser.GameObjects.Text {

	constructor(scene: Phaser.Scene) {
		super(scene, 4, 4, 'fps', { fontSize: '16px', color: '#000040' });
	}

	private recentValues: number[] = [];

	override update(time: number, delta: number) {
		this.recentValues.unshift(delta);
		this.recentValues = this.recentValues.slice(0, 10);
	
		const avgDelta = this.recentValues.reduce((cur, acc) => acc + cur, 0) / this.recentValues.length;
		this.setText(`${(1 / avgDelta * 1000).toFixed(2)}`);
	}
}
