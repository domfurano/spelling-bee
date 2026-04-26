import {Engine, Family, FamilyBuilder, System} from "@mesa-engine/core";
import {AnswerComponent, InputComponent, InteractiveComponent, TextComponent} from "../components";

export class InteractionHandlerSystem extends System {
  private interactionFamily: Family;
  private answerFamily: Family;
  private inputFamily: Family;

  private static readonly validWords = new Set([
    'ALOE', 'ALOES', 'ALCOVE', 'ALCOVES',
    'CAVE', 'CAVES', 'COVE', 'COVES', 'CLOVE', 'CLOVES',
    'LACE', 'LACES', 'LAVE', 'LAVES', 'VALE', 'VALES',
    'LOVE', 'LOVES', 'VOLE', 'VOLES',
    'SLAVE', 'SALVE', 'SOLVE', 'SOLACE',
    'SCALE', 'VOCAL', 'VOCALS', 'COLA', 'COLAS',
    'COAL', 'COALS', 'SOLE', 'SLOE', 'CLOSE',
    'VALVE', 'VALVES', 'LOAVES', 'LOCAL', 'LOCALE', 'LOCALS',
    'COLES', 'OAVES', 'ACES', 'LOCO',
  ]);

  onAttach(engine: Engine) {
    super.onAttach(engine);
    this.interactionFamily = new FamilyBuilder(engine).include(InteractiveComponent).build();
    this.answerFamily = new FamilyBuilder(engine).include(AnswerComponent).build();
    this.inputFamily = new FamilyBuilder(engine).include(InputComponent).build();
    this.setupButtons();
  }

  update(engine: Engine, delta: number): void {
    let letterAdded = false;
    for (const interactionEntity of this.interactionFamily.entities) {
      for (const answerEntity of this.answerFamily.entities) {
        const interactiveComponent = interactionEntity.getComponent(InteractiveComponent);
        if (interactiveComponent.clicked) {
          interactiveComponent.clicked = false;
          const interactionEntityTextComponent = interactionEntity.getComponent(TextComponent);
          const answerEntityTextComponent = answerEntity.getComponent(TextComponent);
          answerEntityTextComponent.text += interactionEntityTextComponent.text;
          letterAdded = true;
        }
      }
    }
    if (letterAdded) {
      this.triggerLetterAddedAnimation();
    }
  }

  private setupButtons() {
    const btnDelete = document.getElementById('btnDelete');
    const btnScramble = document.getElementById('btnScramble');
    const btnEnter = document.getElementById('btnEnter');

    if (btnDelete) {
      btnDelete.addEventListener('click', () => this.deleteLastLetter());
    }
    if (btnScramble) {
      btnScramble.addEventListener('click', () => this.scramble());
    }
    if (btnEnter) {
      btnEnter.addEventListener('click', () => this.enterWord());
    }
  }

  private deleteLastLetter() {
    for (const answerEntity of this.answerFamily.entities) {
      const textComp = answerEntity.getComponent(TextComponent);
      if (textComp.text.length > 0) {
        textComp.text = textComp.text.slice(0, -1);
      }
    }
  }

  private scramble() {
    const entities = [...this.inputFamily.entities];
    if (entities.length < 2) return;
    const outerEntities = entities.slice(1);
    const letters = outerEntities.map(e => e.getComponent(TextComponent).text);
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    outerEntities.forEach((e, idx) => {
      e.getComponent(TextComponent).text = letters[idx];
    });
  }

  private enterWord() {
    for (const answerEntity of this.answerFamily.entities) {
      const textComp = answerEntity.getComponent(TextComponent);
      const word = textComp.text.toUpperCase();

      if (word.length < 4) {
        this.showMessage('Too short!', false);
        this.triggerShakeAnimation();
        return;
      }

      if (InteractionHandlerSystem.validWords.has(word)) {
        this.showMessage('Nice! 🎉', true);
      } else {
        this.showMessage('Not in word list', false);
        this.triggerShakeAnimation();
      }
      textComp.text = '';
    }
  }

  private messageTimeout: ReturnType<typeof setTimeout> | null = null;

  private showMessage(text: string, isCorrect: boolean) {
    const msg = document.getElementById('message');
    if (msg) {
      if (this.messageTimeout !== null) {
        clearTimeout(this.messageTimeout);
        this.messageTimeout = null;
      }
      msg.className = '';
      msg.textContent = text;
      void msg.offsetWidth; // Force reflow to restart animation even for same class
      msg.className = isCorrect ? 'show-correct' : 'show-incorrect';
      this.messageTimeout = setTimeout(() => {
        msg.className = '';
        msg.textContent = '';
        this.messageTimeout = null;
      }, 2000);
    }
  }

  private triggerLetterAddedAnimation() {
    const span = document.getElementById('spnCandidateAnswer');
    if (span) {
      span.classList.remove('letter-added');
      void span.offsetWidth; // Force reflow to restart animation
      span.classList.add('letter-added');
    }
  }

  private triggerShakeAnimation() {
    const span = document.getElementById('spnCandidateAnswer');
    if (span) {
      span.classList.remove('shake', 'letter-added');
      void span.offsetWidth; // Force reflow to restart animation
      span.classList.add('shake');
    }
  }
}
