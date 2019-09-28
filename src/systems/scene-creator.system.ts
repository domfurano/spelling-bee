import {Engine, Entity, System} from "@mesa-engine/core";
import {CandidateAnswerBlueprint, HexagonBlueprint} from "../blueprints";
import {PositionComponent, RenderComponent, TextComponent} from "../components";
import Test = Mocha.Test;

export class SceneCreatorSystem extends System {

  onAttach(engine: Engine) {
    super.onAttach(engine);
    this.generateHoneyComb(engine, window.innerWidth / 2, window.innerHeight / 2);
    this.generateCandidateAnswer(engine, window.innerWidth / 2, window.innerHeight / 2);
  }

  update(engine: Engine, delta: number) {
  }

  generateHoneyComb(engine: Engine, xOrigin: number, yOrigin: number) {
    // Middle hexagon
    const hexagaon: Entity = engine.buildEntity(HexagonBlueprint);
    const positionComponent = hexagaon.getComponent(PositionComponent);
    const renderComponent = hexagaon.getComponent(RenderComponent);
    renderComponent.color = '#f8cd05';
    positionComponent.x = xOrigin;
    positionComponent.y = yOrigin;
    engine.addEntity(hexagaon);
    let distance = 100;
    for (let i = 0; i < 6; i++) {
      const hexagaon: Entity = engine.buildEntity(HexagonBlueprint);
      const positionComponent = hexagaon.getComponent(PositionComponent);
      let angle = i * (Math.PI / 3) + Math.PI / 2;
      positionComponent.x = xOrigin + distance * Math.cos(angle);
      positionComponent.y = yOrigin + distance * Math.sin(angle);
      engine.addEntity(hexagaon);
    }
  }

  generateCandidateAnswer(engine: Engine, xOrigin: number, yOrigin: number) {
    const candidateAnswer: Entity = engine.buildEntity(CandidateAnswerBlueprint);
    const positionComponent = candidateAnswer.getComponent(PositionComponent);
    const textComponent = candidateAnswer.getComponent(TextComponent);
    textComponent.text = 'test';
    positionComponent.x = xOrigin;
    positionComponent.y = yOrigin - 250;
    engine.addEntity(candidateAnswer);
  }
}
