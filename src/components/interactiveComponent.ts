import {Component} from '@mesa-engine/core';
import {Point} from "../model/point";

export class InteractiveComponent implements Component {
  area: [Point];
  click: boolean;
  mousedown: boolean;
}
