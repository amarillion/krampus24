if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let t={};const l=e=>s(e,o),d={module:{uri:o},exports:t,require:l};i[o]=Promise.all(n.map((e=>d[e]||l(e)))).then((e=>(r(...e),t)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-DiTWsv-H.js",revision:null},{url:"assets/phaser-MUclhth5.js",revision:null},{url:"index.html",revision:"e1d1d6289efc4c273dc6998a3dabbd82"},{url:"registerSW.js",revision:"402b66900e731ca748771b6fc5e7a068"},{url:"logo192.png",revision:"5c3a8c449e47525258e6ce241f2e5245"},{url:"logo512.png",revision:"72589da643ad46eb97c4782362ba3cd1"},{url:"manifest.webmanifest",revision:"3c95f8410f348d76ee45053fd2d250d3"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
