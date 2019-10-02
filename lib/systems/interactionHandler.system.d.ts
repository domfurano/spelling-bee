import { Engine, System } from "@mesa-engine/core";
export declare class InteractionHandlerSystem extends System {
    private family;
    private clicks;
    private mouseDowns;
    private mouseUp;
    constructor();
    onAttach(engine: Engine): void;
    update(engine: Engine, delta: number): void;
    private static insidePolygon;
}
