import {Engine, Family, FamilyBuilder, System} from "@mesa-engine/core";
import {
  AnswerComponent,
  HtmlElementComponent,
  InteractiveComponent,
  PositionComponent,
  RenderComponent,
  TextComponent
} from "../components";

const CLICK_HIGHLIGHT_MS = 200;

export class RenderSystem extends System {
  family: Family;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  answerFamily: Family;

  constructor() {
    super();
    this.canvas = document.getElementById('canvas');
    if (this.canvas) {
      this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');
    }
  }

  onAttach(engine: Engine) {
    super.onAttach(engine);
    this.family = new FamilyBuilder(engine).include(PositionComponent, RenderComponent).build();
    this.answerFamily = new FamilyBuilder(engine).include(AnswerComponent).build();
  }

  update(engine: Engine, delta: number) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let entity of this.family.entities) {
      const position = entity.getComponent(PositionComponent);
      const render = entity.getComponent(RenderComponent);
      this.ctx.fillStyle = render.color;
      this.ctx.globalAlpha = render.opacity;

      if (entity.hasComponent(InteractiveComponent)) {
        const interactiveComponent = entity.getComponent(InteractiveComponent);
        const timeSinceClick = Date.now() - interactiveComponent.clickedAt;
        const fillColor = timeSinceClick < CLICK_HIGHLIGHT_MS
          ? RenderSystem.lightenColor(render.color, 0.4)
          : render.color;
        this.ctx.beginPath();
        for (let point of interactiveComponent.area) {
          this.ctx.lineTo(point.x, point.y);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
      }

      if (entity.hasComponent(TextComponent)) {
        const text = entity.getComponent(TextComponent);
        this.ctx.font = text.font;
        this.ctx.fillStyle = text.color;
        this.ctx.textAlign = text.align;
        this.ctx.textBaseline = text.baseLine;
        this.ctx.fillText(text.text, position.x, position.y);
      }
    }

    for (let entity of this.answerFamily.entities) {
      let htmlElementComponent = entity.getComponent(HtmlElementComponent);
      let textComponent = entity.getComponent(TextComponent);
      htmlElementComponent.element.innerText = textComponent.text;
    }
  }

  private static lightenColor(hex: string, factor: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lr = Math.min(255, Math.round(r + (255 - r) * factor));
    const lg = Math.min(255, Math.round(g + (255 - g) * factor));
    const lb = Math.min(255, Math.round(b + (255 - b) * factor));
    return `rgb(${lr}, ${lg}, ${lb})`;
  }
}
