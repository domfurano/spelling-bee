"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderable_blueprint_1 = require("./renderable.blueprint");
var components_1 = require("../components");
var HexagonBlueprint = (function () {
    function HexagonBlueprint() {
        this.blueprints = [new renderable_blueprint_1.RenderableBlueprint];
        this.components = [
            {
                component: components_1.SizeComponent,
                value: {
                    value: 55
                }
            },
            {
                component: components_1.RenderComponent,
                value: {
                    color: '#e6e6e6',
                    opacity: 1,
                }
            },
            {
                component: components_1.TextComponent,
                value: {
                    text: '~',
                    font: '32px sans-serif',
                    color: 'black',
                    align: 'center',
                    baseLine: 'middle'
                }
            },
            {
                component: components_1.InteractiveComponent,
                value: {
                    area: new Array(),
                    click: false
                }
            }
        ];
    }
    return HexagonBlueprint;
}());
exports.HexagonBlueprint = HexagonBlueprint;
//# sourceMappingURL=hexagon.blueprint.js.map