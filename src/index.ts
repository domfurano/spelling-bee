import { createScene } from './systems/scene-creator.system';
import { TextGenerationSystem } from './systems/text-generation.system';
import { InteractionHandlerSystem } from './systems/interactionHandlerSystem';

const honeycombEl = document.getElementById('honeycomb')!;
const answerEl = document.getElementById('spnCandidateAnswer')!;

const state = createScene(honeycombEl);
TextGenerationSystem.applyLetters(
  state.tiles,
  TextGenerationSystem.shuffleWord('ALCOVES')
);

for (const tile of state.tiles) {
  tile.element.addEventListener('click', () => {
    state.answer += tile.letter;
    answerEl.innerText = state.answer;
    InteractionHandlerSystem.triggerLetterAddedAnimation();
  });
}

document.getElementById('btnDelete')?.addEventListener('click', () => {
  InteractionHandlerSystem.deleteLastLetter(state);
  answerEl.innerText = state.answer;
});
document.getElementById('btnScramble')?.addEventListener('click', () => {
  InteractionHandlerSystem.scramble(state.tiles);
});
document.getElementById('btnEnter')?.addEventListener('click', () => {
  InteractionHandlerSystem.enterWord(state);
  answerEl.innerText = state.answer;
});
