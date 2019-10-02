import { Engine, Family, System } from "@mesa-engine/core";
export declare class TextGenerationSystem extends System {
    family: Family;
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    word: string;
    constructor();
    onAttach(engine: Engine): void;
    update(engine: Engine, delta: number): void;
    private static shuffleWord;
}
