import {Component} from '@mesa-engine/core';

export class TextComponent implements Component {
  text: string = '';
  font: string;
  color: string;
  align: string;
  baseLine: string;
}