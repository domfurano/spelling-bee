import {Blueprint} from '@mesa-engine/core';
import {AnswerComponent, HtmlElementComponent, TextComponent} from '../components';

export class CandidateAnswerBlueprint implements Blueprint {
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
        id: 'spnCandidateAnswer'
      }
    },
    {
      component: HtmlElementComponent
    }
  ];
}
