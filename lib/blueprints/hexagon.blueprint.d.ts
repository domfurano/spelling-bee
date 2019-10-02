import { Blueprint } from '@mesa-engine/core';
import { RenderableBlueprint } from './renderable.blueprint';
import { InteractiveComponent, RenderComponent, SizeComponent, TextComponent } from '../components';
export declare class HexagonBlueprint implements Blueprint {
    blueprints: RenderableBlueprint[];
    components: ({
        component: typeof SizeComponent;
        value: SizeComponent;
    } | {
        component: typeof RenderComponent;
        value: RenderComponent;
    } | {
        component: typeof TextComponent;
        value: TextComponent;
    } | {
        component: typeof InteractiveComponent;
        value: InteractiveComponent;
    })[];
}
