"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderable_blueprint_1 = require("./renderable.blueprint");
var components_1 = require("../components");
var CandidateAnswerBlueprint = (function () {
    function CandidateAnswerBlueprint() {
        this.blueprints = [new renderable_blueprint_1.RenderableBlueprint];
        this.components = [
            {
                component: components_1.TextComponent,
                value: {
                    text: '~',
                    font: '52px sans-serif',
                    color: 'black'
                }
            }
        ];
    }
    return CandidateAnswerBlueprint;
}());
exports.CandidateAnswerBlueprint = CandidateAnswerBlueprint;
//# sourceMappingURL=candidateAnswerBlueprint.js.map