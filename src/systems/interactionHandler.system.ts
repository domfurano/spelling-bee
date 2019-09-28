import {Engine, Family, FamilyBuilder, System} from "@mesa-engine/core";
import {InteractiveComponent} from "../components";
import {Point} from "../model/point";

export class InteractionHandlerSystem extends System {
  private family: Family;
  private clicks: Array<Point>;
  private mouseDowns: Array<Point>;
  private mouseUp: boolean;


  constructor() {
    super();
    this.clicks = [];
    this.mouseDowns = [];
    this.mouseUp = false;
  }

  onAttach(engine: Engine) {
    super.onAttach(engine);
    this.family = new FamilyBuilder(engine).include(InteractiveComponent).build();
    let canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.addEventListener('click', event => {
        this.clicks.push(new Point(event.clientX, event.clientY));
      });
      canvas.addEventListener('mousedown', event => {
        this.mouseDowns.push(new Point(event.clientX, event.clientY));
        this.mouseUp = false;
      });
      canvas.addEventListener('mouseup', event => {
        this.mouseUp = true;
      });
    }
  }

  update(engine: Engine, delta: number): void {
    for (const entity of this.family.entities) {
      for (const click of this.clicks) {
        const interactiveComponent = entity.getComponent(InteractiveComponent);
        const inside: boolean = InteractionHandlerSystem.insidePolygon(interactiveComponent.area, 6, click);
        if (inside) {
          interactiveComponent.click = true;
        }
      }
      for (const mouseDown of this.mouseDowns) {
        const interactiveComponent = entity.getComponent(InteractiveComponent);
        const inside: boolean = InteractionHandlerSystem.insidePolygon(interactiveComponent.area, 6, mouseDown);
        if (inside && !this.mouseUp) {
          interactiveComponent.mousedown = true;
        } else {
          interactiveComponent.mousedown = false;
        }
      }
    }
    this.clicks = [];
    this.mouseDowns = [];
  }

  // http://www.eecs.umich.edu/courses/eecs380/HANDOUTS/PROJ2/InsidePoly.html
  private static insidePolygon(points: [Point], N: number, p: Point) {
    let counter: number = 0;
    let i: number;
    let xInters: number;
    let p1: Point;
    let p2: Point;

    p1 = points[0];
    for (i = 1; i <= N; i++) {
      p2 = points[i % N];
      if (p.y > InteractionHandlerSystem.min(p1.y, p2.y)) {
        if (p.y <= InteractionHandlerSystem.max(p1.y, p2.y)) {
          if (p.x <= InteractionHandlerSystem.max(p1.x, p2.x)) {
            if (p1.y != p2.y) {
              xInters = (p.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
              if (p1.x == p2.x || p.x <= xInters) {
                counter++;
              }
            }
          }
        }
      }
      p1 = p2;
    }
    return counter % 2 != 0;
  }

  private static min = (x, y) => x < y ? x : y;

  private static max = (x, y) => x > y ? x : y;
}
