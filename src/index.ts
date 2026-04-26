import { createScene } from './systems/scene-creator.system';
import { TextGenerationSystem } from './systems/text-generation.system';
import { InteractionListenerSystem } from './systems/interactionListenerSystem';
import { InteractionHandlerSystem } from './systems/interactionHandlerSystem';
import { RenderSystem } from './systems/render.system';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const answerEl = document.getElementById('spnCandidateAnswer')!;

const state = createScene();
TextGenerationSystem.applyLetters(state.tiles, TextGenerationSystem.shuffleWord('ALCOVES'));

const renderer = new RenderSystem(canvas, answerEl);

InteractionListenerSystem.setup(canvas, state);

document.getElementById('btnDelete')?.addEventListener('click', () => {
  InteractionHandlerSystem.deleteLastLetter(state);
});
document.getElementById('btnScramble')?.addEventListener('click', () => {
  InteractionHandlerSystem.scramble(state.tiles);
});
document.getElementById('btnEnter')?.addEventListener('click', () => {
  InteractionHandlerSystem.enterWord(state);
});

let lastRender = 0;
function loop(timestamp: number): void {
  lastRender = timestamp;
  if (InteractionHandlerSystem.processTileClicks(state)) {
    InteractionHandlerSystem.triggerLetterAddedAnimation();
  }
  renderer.render(state);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
