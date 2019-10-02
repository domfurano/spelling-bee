import {Blueprint} from "@mesa-engine/core";
import {InteractiveComponent} from "../components";

export class ButtonBlueprint implements Blueprint {
  components = [
    {component: InteractiveComponent}
  ];
}