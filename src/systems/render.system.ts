import { Engine, Family, FamilyBuilder, System } from "@mesa-engine/core";
import { InteractiveComponent, PositionComponent, RenderComponent, SizeComponent, TextComponent, AnswerComponent } from "../components";
import { Point } from "../model/point";

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

      if (entity.hasComponent(SizeComponent)) {
        const size = entity.getComponent(SizeComponent);
        this.ctx.beginPath();
        for (let i = 0; i < 7; i++) {
          const x = position.x + size.value * Math.cos(i * (Math.PI / 3));
          const y = position.y + size.value * Math.sin(i * (Math.PI / 3));
          this.ctx.lineTo(x, y);
          if (entity.hasComponent(InteractiveComponent)) {
            const click = entity.getComponent(InteractiveComponent);
            click.area.push(new Point(x, y));
          }
        }

        this.ctx.fillStyle = render.color;
        if (entity.hasComponent(InteractiveComponent)) {
          const click = entity.getComponent(InteractiveComponent);
          if (click.mousedown) {
            this.ctx.fillStyle = 'red';
          }
        }
        this.ctx.closePath();
        this.ctx.fill();
      }
      if (entity.hasComponent(TextComponent)) {
        const text = entity.getComponent(TextComponent);
        this.ctx.font = text.font;
        this.ctx.fillStyle = text.color;
        this.ctx.textAlign = text.align;
        this.ctx.textBaseline = text.baseLine;
        if (entity.hasComponent(AnswerComponent)) {
          const answer = entity.getComponent(AnswerComponent);
          this.ctx.fillText(answer.answer, position.x, position.y);
        } else {
          this.ctx.fillText(text.text, position.x, position.y);
        }
      }
    }
  }
}