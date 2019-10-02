import {Blueprint} from '@mesa-engine/core';
import {RenderableBlueprint} from './renderable.blueprint';
import {InteractiveComponent, RenderComponent, SizeComponent, TextComponent} from '../components';
import {Point} from '../model/point';

export class HexagonBlueprint implements Blueprint {
  blueprints = [new RenderableBlueprint];
  components = [
    {
      component: SizeComponent,
      value: <SizeComponent>{
        value: 55
      }
    },
    {
      component: RenderComponent,
      value: <RenderComponent>{
        color: '#e6e6e6', //#d9d9d9
        opacity: 1,
        //#dfb804 gold
      }
    },
    {
      component: TextComponent,
      value: <TextComponent>{
        text: '~',
        font: '32px sans-serif',
        color: 'black',
        align: 'center',
        baseLine: 'middle'
      }
    },
    {
      component: InteractiveComponent,
      value: <InteractiveComponent>{
        area: new Array<Point>(),
        clicked: false
      }
    }
  ];
}