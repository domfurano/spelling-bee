import {Engine, Family, FamilyBuilder, System} from "@mesa-engine/core";
import {PositionComponent, TextComponent} from "../components";

export class TextGenerationSystem extends System {
  family: Family;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  word: string;

  constructor() {
    super();

    this.word = TextGenerationSystem.shuffleWord('ALCOVES');
    this.canvas = document.getElementsByTagName('canvas')[0];
    this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');
  }

  onAttach(engine: Engine) {
    super.onAttach(engine);
    this.family = new FamilyBuilder(engine).include(TextComponent, PositionComponent).build();
  }

  update(engine: Engine, delta: number) {
    for (let i = 0; i < this.family.entities.length; i++) {
      let entity = this.family.entities[i];
      if (entity.hasComponent(TextComponent)) {
        const text = entity.getComponent(TextComponent);
        text.text = this.word[i];
      }
    }
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
