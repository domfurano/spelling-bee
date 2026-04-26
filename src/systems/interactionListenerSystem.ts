import {Engine, Family, FamilyBuilder, System} from "@mesa-engine/core";
import {InteractiveComponent, TextComponent} from "../components";
import {Point} from "../model/point";

export class InteractionListenerSystem extends System {
  private interactionFamily: Family;
  private clicks: Array<Point>;
  private answer: string;


  constructor() {
    super();
    this.clicks = [];
  }

  onAttach(engine: Engine) {
    super.onAttach(engine);
    this.interactionFamily = new FamilyBuilder(engine).include(InteractiveComponent).build();
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas) {
      canvas.addEventListener('click', event => {
        this.clicks.push(this.getCanvasPoint(canvas, event.clientX, event.clientY));
      });
      canvas.addEventListener('touchstart', event => {
        event.preventDefault();
        for (let i = 0; i < event.touches.length; i++) {
          const touch = event.touches[i];
          this.clicks.push(this.getCanvasPoint(canvas, touch.clientX, touch.clientY));
        }
      }, {passive: false});
    }
  }

  private getCanvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number): Point {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return new Point((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
  }

  update(engine: Engine, delta: number): void {
    for (const entity of this.interactionFamily.entities) {
      if (entity.hasComponent(InteractiveComponent)) {
        for (const click of this.clicks) {
          const interactiveComponent = entity.getComponent(InteractiveComponent);
          const inside: boolean = InteractionListenerSystem.insidePolygon(interactiveComponent.area, 6, click);
          if (inside) {
            interactiveComponent.clicked = true;
            interactiveComponent.clickedAt = Date.now();
            if (entity.hasComponent(TextComponent)) {
              const textComponent = entity.getComponent(TextComponent);
              this.answer += textComponent.text;
              console.debug(textComponent.text);
            }
          }
        }
      }
    }
    this.clicks = [];
  }

  // http://www.eecs.umich.edu/courses/eecs380/HANDOUTS/PROJ2/InsidePoly.html
  private static insidePolygon(points: Point[], N: number, p: Point) {
    let counter: number = 0;
    let i: number;
    let xInters: number;
    let p1: Point;
    let p2: Point;

    p1 = points[0];
    for (i = 1; i <= N; i++) {
      p2 = points[i % N];
      if (p.y > Math.min(p1.y, p2.y)) {
        if (p.y <= Math.max(p1.y, p2.y)) {
          if (p.x <= Math.max(p1.x, p2.x)) {
            if (p1.y !== p2.y) {
              xInters = (p.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
              if (p1.x === p2.x || p.x <= xInters) {
                counter++;
              }
            }
          }
        }
      }
      p1 = p2;
    }
    return counter % 2 !== 0;
  }
}
