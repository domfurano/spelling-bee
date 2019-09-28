import {Blueprint} from '@mesa-engine/core';
import {RenderableBlueprint} from './renderable.blueprint';
import {TextComponent} from '../components';

export class CandidateAnswerBlueprint implements Blueprint {
  blueprints = [new RenderableBlueprint];
  components = [
    {
      component: TextComponent,
      value: <TextComponent>{
        text: '~',
        font: '52px sans-serif',
        color: 'black'
      }
    }
  ];
}