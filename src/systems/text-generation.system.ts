import {Engine, Family, FamilyBuilder, System} from "@mesa-engine/core";
import {InputComponent, TextComponent} from "../components";

export class TextGenerationSystem extends System {
  inputFamily: Family;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  word: string;

  constructor() {
    super();
    this.word = TextGenerationSystem.shuffleWord('ALCOVES');
    const canvasElement = document.getElementById('canvas');
    if (!(canvasElement instanceof HTMLCanvasElement)) {
      throw new Error("Expected element with id 'canvas' to be an HTMLCanvasElement.");
    }

    const context = canvasElement.getContext('2d');
    if (context === null) {
      throw new Error("Failed to acquire 2D rendering context from canvas.");
    }

    this.canvas = canvasElement;
    this.ctx = context;
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
