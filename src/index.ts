import {Engine} from '@mesa-engine/core';
import * as s from './systems';

export class App {
  engine: Engine;
  lastRender = 0;

  constructor() {
    this.engine = new Engine();
    this.engine.addSystems(...Object.keys(s).map(system => new s[system]()));
    window.requestAnimationFrame(this.loop.bind(this));
  }

  loop(timestamp) {
    window.requestAnimationFrame(this.loop.bind(this));
    var progress = timestamp - this.lastRender;
    this.engine.update(progress);
    this.lastRender = timestamp;
  }
}

new App();
