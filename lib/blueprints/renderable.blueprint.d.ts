import { Blueprint } from '@mesa-engine/core';
import { PositionComponent, RenderComponent } from '../components';
export declare class RenderableBlueprint implements Blueprint {
    components: ({
        component: typeof PositionComponent;
    } | {
        component: typeof RenderComponent;
    })[];
}
