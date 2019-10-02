import {Engine, Family, FamilyBuilder, System} from "@mesa-engine/core";
import {InputComponent, PositionComponent, TextComponent} from "../components";

export class TextGenerationSystem extends System {
  inputFamily: Family;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  word: string;

  constructor() {
    super();
    this.word = TextGenerationSystem.shuffleWord('ALCOVES');
    this.canvas = document.getElementById('canvas');
    this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');
  }

  onAttach(engine: Engine) {
    super.onAttach(engine);
    this.inputFamily = new FamilyBuilder(engine).include(InputComponent).build();
    for (let i = 0; i < this.inputFamily.entities.length; i++) {
      let entity = this.inputFamily.entities[i];
      if (entity.hasComponent(TextComponent)) {
        const text = entity.getComponent(TextComponent);
        text.text = this.word[i];
      }
    }
  }

  update(engine: Engine, delta: number) {
  }

  private static shuffleWord(word: string) {
    let array = word.split('');
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array.join('');
  }
}
