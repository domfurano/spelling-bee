import { Engine, Entity, System } from "@mesa-engine/core";
import { CandidateAnswerBlueprint, HexagonBlueprint } from "../blueprints";
import { PositionComponent, RenderComponent, TextComponent, AnswerComponent } from "../components";
import Test = Mocha.Test;

export class SceneCreatorSystem extends System {

  private entities: Entity[] = [];

  onAttach(engine: Engine) {
    super.onAttach(engine);
    window.addEventListener('resize', event => {
      this.entities.forEach(entity => engine.removeEntity(entity));
      this.entities = [];
      this.create(engine);
    });
    this.create(engine);
  }

  update(engine: Engine, delta: number) {
  }

  create(engine: Engine) {
    this.createHoneyComb(engine, window.innerWidth / 2, window.innerHeight / 2);
    this.createCandidateAnswer(engine, window.innerWidth / 2, window.innerHeight / 2);
  }

  createHoneyComb(engine: Engine, xOrigin: number, yOrigin: number) {
    // Middle hexagon
    const hexagaon: Entity = engine.buildEntity(HexagonBlueprint);
    const positionComponent = hexagaon.getComponent(PositionComponent);
    const renderComponent = hexagaon.getComponent(RenderComponent);
    renderComponent.color = '#f8cd05';
    positionComponent.x = xOrigin;
    positionComponent.y = yOrigin;
    engine.addEntity(hexagaon);
    this.entities.push(hexagaon);
    let distance = 100;
    for (let i = 0; i < 6; i++) {
      const hexagaon: Entity = engine.buildEntity(HexagonBlueprint);
      const positionComponent = hexagaon.getComponent(PositionComponent);
      let angle = i * (Math.PI / 3) + Math.PI / 2;
      positionComponent.x = xOrigin + distance * Math.cos(angle);
      positionComponent.y = yOrigin + distance * Math.sin(angle);
      engine.addEntity(hexagaon);
      this.entities.push(hexagaon);
    }
  }

  createCandidateAnswer(engine: Engine, xOrigin: number, yOrigin: number) {
    const candidateAnswer: Entity = engine.buildEntity(CandidateAnswerBlueprint);
    const positionComponent = candidateAnswer.getComponent(PositionComponent);
    positionComponent.x = xOrigin;
    positionComponent.y = yOrigin - 250;
    engine.addEntity(candidateAnswer);
    this.entities.push(candidateAnswer);
  }
}
