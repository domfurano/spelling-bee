"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var components_1 = require("../components");
var RenderableBlueprint = (function () {
    function RenderableBlueprint() {
        this.components = [
            { component: components_1.PositionComponent },
            { component: components_1.RenderComponent }
        ];
    }
    return RenderableBlueprint;
}());
exports.RenderableBlueprint = RenderableBlueprint;
//# sourceMappingURL=renderable.blueprint.js.map