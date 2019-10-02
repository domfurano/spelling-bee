import {Engine, Family, FamilyBuilder, System} from "@mesa-engine/core";
import {InteractiveComponent, PositionComponent, RenderComponent, TextComponent} from "../components";

export class RenderSystem extends System {
  family: Family;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  constructor() {
    super();
    this.canvas = document.getElementById('canvas');
    if (this.canvas) {
      this.canvas.id = 'canvas';
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');
    }
  }

  onAttach(engine: Engine) {
    super.onAttach(engine);
    this.family = new FamilyBuilder(engine).include(PositionComponent, RenderComponent).build();
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
        this.ctx.beginPath();
        for (let point of interactiveComponent.area) {
          this.ctx.lineTo(point.x, point.y);
        }
        this.ctx.closePath();
        this.ctx.fillStyle = render.color;
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
  }
}