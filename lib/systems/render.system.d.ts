import { Engine, Family, System } from "@mesa-engine/core";
export declare class RenderSystem extends System {
    family: Family;
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    constructor();
    onAttach(engine: Engine): void;
    update(engine: Engine, delta: number): void;
}
