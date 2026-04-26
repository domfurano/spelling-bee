import { createScene } from './systems/scene-creator.system';
import { TextGenerationSystem } from './systems/text-generation.system';
import { InteractionHandlerSystem } from './systems/interactionHandlerSystem';
import { ALCOVES_PUZZLE } from './puzzle';

const honeycombEl = document.getElementById('honeycomb')!;
const answerEl = document.getElementById('spnCandidateAnswer')!;

const state = createScene(honeycombEl, ALCOVES_PUZZLE);
const shuffledOuter = TextGenerationSystem.shuffleWord(
  ALCOVES_PUZZLE.outerLetters.join('')
);
TextGenerationSystem.applyLetters(
  state.tiles,
  ALCOVES_PUZZLE.centerLetter + shuffledOuter
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
