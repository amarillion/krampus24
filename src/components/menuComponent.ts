// import menuBg from '../../assets/images/menu.png';
import QRCode from 'qrcode';
import { assert } from '../util/assert';
import buttonClickSfxUrl from '../assets/Door_unlock.ogg?url';

export class MenuComponent extends HTMLElement {

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.render();
	}

	render() {
		assert(this.shadowRoot);
		this.shadowRoot.innerHTML = `
		<style>
			:host {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 100vh;
			}

			button {
				background-color: #4C50AF; /* Blue */
				border: none;
				color: white;
				text-align: center;
				text-decoration: none;
				display: inline-block;
				font-size: 16px;
				margin: 2rem;
				width: 10rem;
				height: 4rem;
			}
			button:hover {
				background-color: #6C70DF; /* Blue */
			}
			.main {
				position: absolute;
			}
			.qrwrapper {
				position: absolute;
				right: 1rem;
				top: 1rem;
				text-align: center;
			}
			.buttonBar {
				display: flex;
				flex-direction: column;
			}
		</style>
		
		<!-- Animated gradients generated with ChatGPT -->
		<svg width="100%" height="100vh">
			<!-- Define the gradients -->
			<defs>
			<linearGradient id="gradientAnimation" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stop-color="#ff7e5f">
				<animate attributeName="stop-color" values="#ff7e5f; #feb47b; #6a82fb; #ff7e5f" dur="5s" repeatCount="indefinite" />
				</stop>
				<stop offset="50%" stop-color="#6a82fb">
				<animate attributeName="stop-color" values="#6a82fb; #ff7e5f; #feb47b; #6a82fb" dur="5s" repeatCount="indefinite" />
				</stop>
				<stop offset="100%" stop-color="#feb47b">
				<animate attributeName="stop-color" values="#feb47b; #6a82fb; #ff7e5f; #feb47b" dur="5s" repeatCount="indefinite" />
				</stop>
			</linearGradient>

			<linearGradient id="overlayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="rgba(255, 255, 255, 0.5)" />
				<stop offset="100%" stop-color="rgba(0, 0, 0, 0.5)" />
			</linearGradient>

			<!-- Simulated Mesh Gradient using Radial Gradients -->
			<radialGradient id="meshGradient" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color="#ff9a9e">
				<animate attributeName="stop-color" values="#ff9a9e; #fad0c4; #ffdde1; #ff9a9e" dur="6s" repeatCount="indefinite" />
				</stop>
				<stop offset="50%" stop-color="#fad0c4">
				<animate attributeName="stop-color" values="#fad0c4; #ffdde1; #ff9a9e; #fad0c4" dur="6s" repeatCount="indefinite" />
				</stop>
				<stop offset="100%" stop-color="#ffdde1">
				<animate attributeName="stop-color" values="#ffdde1; #ff9a9e; #fad0c4; #ffdde1" dur="6s" repeatCount="indefinite" />
				</stop>
			</radialGradient>
			</defs>

			<!-- Apply the gradients -->
			<rect width="100%" height="100%" fill="url(#gradientAnimation)" />
			<rect width="100%" height="100%" fill="url(#overlayGradient)" />
			<rect width="100%" height="100%" fill="url(#meshGradient)" opacity="0.5" />
		</svg>

		<div class="main">
			<div class="buttonBar">
				<button id="startGame">Start Game</button>
				<button id="fullScreen">Full Screen</button>
			</div>
		</div>
		<div class="qrwrapper">
			<small>play on mobile!</small><br>
			<canvas id="qrcanvas"></canvas>
		</div>
		 <audio id="sfx"><source src="${buttonClickSfxUrl}"></audio>
	`;
	}

	playAudio() {
		const sfx = this.shadowRoot?.getElementById('sfx') as HTMLAudioElement;
		if (sfx) {
			sfx.autoplay = true;
			sfx.load();
		}
	}

	connectedCallback() {
		this.shadowRoot?.querySelector('#startGame')?.addEventListener('click', () => {
			this.playAudio();
			this.dispatchEvent(new CustomEvent('Start'));
			this.dispatchEvent(new CustomEvent('button-pressed'));
		});

		this.shadowRoot?.querySelector('#fullScreen')?.addEventListener('click', () => {
			this.playAudio();
			const elem = document.documentElement;
			elem.requestFullscreen({ navigationUI: 'show' }).then(() => { }).catch(err => {
				alert(`An error occurred while trying to switch into full-screen mode: ${err.message} (${err.name})`);
			});
		});

		const canvas = this.shadowRoot?.getElementById('qrcanvas');
 
		QRCode.toCanvas(canvas, window.location.toString(), function (error: unknown) {
			if (error) console.error(error);
		});

	}

}
