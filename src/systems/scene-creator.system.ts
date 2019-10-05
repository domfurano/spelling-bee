import {Engine, Entity, System} from "@mesa-engine/core";
import {CandidateAnswerBlueprint, HexagonBlueprint} from "../blueprints";
import {
  AnswerComponent,
  HtmlElementComponent,
  InteractiveComponent,
  PositionComponent,
  RenderComponent,
  SizeComponent, TextComponent
} from "../components";
import {Point} from "../model/point";
import html = Mocha.reporters.html;

export class SceneCreatorSystem extends System {
  private static thirdPi: number = Math.PI / 3;
  private static halfPi: number = Math.PI / 2;

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
    const halfWidth = 150;
    const halfHeight = 160;
    this.createHoneyComb(engine, halfWidth, halfHeight);
    this.createCandidateAnswer(engine, halfWidth, halfHeight);
  }

  createHoneyComb(engine: Engine, xOrigin: number, yOrigin: number) {
    // Middle hexagon
    const hexagaon: Entity = engine.buildEntity(HexagonBlueprint);
    const positionComponent = hexagaon.getComponent(PositionComponent);
    const renderComponent = hexagaon.getComponent(RenderComponent);
    const interactiveComponent = hexagaon.getComponent(InteractiveComponent);
    const sizeComponent = hexagaon.getComponent(SizeComponent);
    renderComponent.color = '#f8cd05';
    positionComponent.x = xOrigin;
    positionComponent.y = yOrigin;
    SceneCreatorSystem.createHexagonArea(positionComponent, sizeComponent, interactiveComponent);
    engine.addEntity(hexagaon);
    this.entities.push(hexagaon);
    let distance = 100;
    for (let i = 0; i < 6; i++) {
      const hexagaon: Entity = engine.buildEntity(HexagonBlueprint);
      const positionComponent = hexagaon.getComponent(PositionComponent);
      const sizeComponent = hexagaon.getComponent(SizeComponent);
      const interactiveComponent = hexagaon.getComponent(InteractiveComponent);
      let angle = i * SceneCreatorSystem.thirdPi + SceneCreatorSystem.halfPi;
      positionComponent.x = xOrigin + distance * Math.cos(angle);
      positionComponent.y = yOrigin + distance * Math.sin(angle);
      SceneCreatorSystem.createHexagonArea(positionComponent, sizeComponent, interactiveComponent);
      engine.addEntity(hexagaon);
      this.entities.push(hexagaon);
    }
  }

  private static createHexagonArea(positionComponent, sizeComponent, interactiveComponent) {
    for (let i = 0; i < 7; i++) {
      const x = positionComponent.x + sizeComponent.value * Math.cos(i * SceneCreatorSystem.thirdPi);
      const y = positionComponent.y + sizeComponent.value * Math.sin(i * SceneCreatorSystem.thirdPi);
      interactiveComponent.area.push(new Point(x, y));
    }
  }

  createCandidateAnswer(engine: Engine, xOrigin: number, yOrigin: number) {
    const candidateAnswer: Entity = engine.buildEntity(CandidateAnswerBlueprint);
    const answerComponent = candidateAnswer.getComponent(AnswerComponent);
    const htmlElementComponent = candidateAnswer.getComponent(HtmlElementComponent);
    const textComponent = candidateAnswer.getComponent(TextComponent);
    htmlElementComponent.element = document.getElementById(answerComponent.id)!;
    engine.addEntity(candidateAnswer);
    this.entities.push(candidateAnswer);
  }
}
