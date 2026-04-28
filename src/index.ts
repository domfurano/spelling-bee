import { createScene } from './systems/scene-creator.system';
import { TextGenerationSystem } from './systems/text-generation.system';
import { InteractionHandlerSystem } from './systems/interactionHandlerSystem';
import type { EnterOutcome } from './systems/interactionHandlerSystem';
import { getDailyPuzzle, assertValidPuzzle } from './puzzle';
import { saveProgress, loadProgress, utcDateKey } from './persistence';
import puzzles from './puzzles.json';

const today = new Date();
const puzzle = getDailyPuzzle(puzzles, today);
assertValidPuzzle(puzzle);
const dateKey = utcDateKey(today);

const honeycombEl = document.getElementById('honeycomb')!;
const answerEl = document.getElementById('spnCandidateAnswer')!;
const scoreEl = document.getElementById('spnScore')!;
const rankEl = document.getElementById('spnRank')!;
const wordCountEl = document.getElementById('spnWordCount')!;
const foundWordsListEl = document.getElementById('foundWordsList')!;

const max = InteractionHandlerSystem.maxScore(
  puzzle.validWords,
  puzzle.pangrams
);

function refreshScoreDisplay(): void {
  scoreEl.innerText = `Score: ${state.score}`;
  rankEl.innerText = InteractionHandlerSystem.getRank(state.score, max);
  wordCountEl.innerText = `${state.foundWords.size} / ${puzzle.validWords.length} words`;
}

function renderFoundWords(): void {
  const pangrams = new Set(puzzle.pangrams);
  foundWordsListEl.innerHTML = '';
  [...state.foundWords].sort().forEach((word) => {
    const li = document.createElement('li');
    li.textContent = word;
    li.dataset.word = word;
    if (pangrams.has(word)) li.classList.add('pangram');
    foundWordsListEl.appendChild(li);
  });
}

function handleEnterOutcome(outcome: EnterOutcome, word: string): void {
  if (outcome === 'already-found') {
    const li = foundWordsListEl.querySelector<HTMLElement>(
      `[data-word="${word}"]`
    );
    if (li) {
      li.classList.remove('already-found-flash');
      void li.offsetWidth;
      li.classList.add('already-found-flash');
      li.scrollIntoView({ block: 'nearest' });
    }
  }
}

const state = createScene(honeycombEl, puzzle);

const savedProgress = loadProgress(dateKey);
if (savedProgress) {
  state.foundWords = savedProgress.foundWords;
  state.score = savedProgress.score;
  refreshScoreDisplay();
  renderFoundWords();
}

const shuffledOuter = TextGenerationSystem.shuffleWord(
  puzzle.outerLetters.join('')
);
TextGenerationSystem.applyLetters(
  state.tiles,
  puzzle.centerLetter + shuffledOuter
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
  const word = state.answer.toUpperCase();
  const outcome = InteractionHandlerSystem.enterWord(state);
  answerEl.innerText = state.answer;
  refreshScoreDisplay();
  renderFoundWords();
  handleEnterOutcome(outcome, word);
  saveProgress(dateKey, state.foundWords, state.score);
});

document.addEventListener('keydown', (e) => {
  const word = state.answer.toUpperCase();
  const outcome = InteractionHandlerSystem.handleKeydown(e, state, answerEl);
  refreshScoreDisplay();
  renderFoundWords();
  if (outcome !== null) handleEnterOutcome(outcome, word);
  saveProgress(dateKey, state.foundWords, state.score);
});
