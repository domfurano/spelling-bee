import {Engine, Family, FamilyBuilder, System} from "@mesa-engine/core";
import {AnswerComponent, InteractiveComponent, TextComponent} from "../components";
import {Point} from "../model/point";

export class InteractionHandlerSystem extends System {
  private interactionFamily: Family;
  private answerFamily: Family;
  private clicks: Array<Point>;
  private answer: string;


  constructor() {
    super();
    this.clicks = [];
  }

  onAttach(engine: Engine) {
    super.onAttach(engine);
    this.interactionFamily = new FamilyBuilder(engine).include(InteractiveComponent).build();
    this.answerFamily = new FamilyBuilder(engine).include(AnswerComponent).build();
  }

  update(engine: Engine, delta: number): void {
    for (const interactionEntity of this.interactionFamily.entities) {
      for (const answerEntity of this.answerFamily.entities) {
        let interactiveComponent = interactionEntity.getComponent(InteractiveComponent);
        if (interactiveComponent.clicked) {
          interactiveComponent.clicked = false;
          let interactionEntityTextComponent = interactionEntity.getComponent(TextComponent);
          let answerEntityTextComponent = answerEntity.getComponent(TextComponent);
          answerEntityTextComponent.text = interactionEntityTextComponent.text;
        }
      }
    }
  }
}
