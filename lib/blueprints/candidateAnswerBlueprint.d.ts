import { Blueprint } from '@mesa-engine/core';
import { RenderableBlueprint } from './renderable.blueprint';
import { TextComponent } from '../components';
export declare class CandidateAnswerBlueprint implements Blueprint {
    blueprints: RenderableBlueprint[];
    components: {
        component: typeof TextComponent;
        value: TextComponent;
    }[];
}
