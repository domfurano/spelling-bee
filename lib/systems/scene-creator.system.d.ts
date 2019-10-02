import { Engine, System } from "@mesa-engine/core";
export declare class SceneCreatorSystem extends System {
    onAttach(engine: Engine): void;
    reset(engine: Engine, reset: boolean): void;
    update(engine: Engine, delta: number): void;
    generateHoneyComb(engine: Engine, xOrigin: number, yOrigin: number, reset: boolean): void;
    generateCandidateAnswer(engine: Engine, xOrigin: number, yOrigin: number, reset: boolean): void;
}
