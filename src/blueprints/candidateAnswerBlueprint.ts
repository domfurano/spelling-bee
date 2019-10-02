import {Blueprint} from '@mesa-engine/core';
import {RenderableBlueprint} from './renderable.blueprint';
import {TextComponent, AnswerComponent} from '../components';

export class CandidateAnswerBlueprint implements Blueprint {
  blueprints = [new RenderableBlueprint];
  components = [
    {
      component: TextComponent,
      value: <TextComponent>{
        font: '52px sans-serif',
        color: 'black'
      }
    },
    {
      component: AnswerComponent,
      value: <AnswerComponent>{
        answer: ''
      }
    }
  ];
}