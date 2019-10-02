import { Engine } from '@mesa-engine/core';
export declare class App {
    engine: Engine;
    lastRender: number;
    constructor();
    loop(timestamp: any): void;
}
