"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@mesa-engine/core");
var blueprints_1 = require("../blueprints");
var components_1 = require("../components");
var SceneCreatorSystem = (function (_super) {
    __extends(SceneCreatorSystem, _super);
    function SceneCreatorSystem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SceneCreatorSystem.prototype.onAttach = function (engine) {
        var _this = this;
        _super.prototype.onAttach.call(this, engine);
        window.addEventListener('resize', function (event) { return _this.reset(engine, true); });
        this.reset(engine, false);
    };
    SceneCreatorSystem.prototype.reset = function (engine, reset) {
        this.generateHoneyComb(engine, window.innerWidth / 2, window.innerHeight / 2, reset);
        this.generateCandidateAnswer(engine, window.innerWidth / 2, window.innerHeight / 2, reset);
    };
    SceneCreatorSystem.prototype.update = function (engine, delta) {
    };
    SceneCreatorSystem.prototype.generateHoneyComb = function (engine, xOrigin, yOrigin, reset) {
        var hexagaon = engine.buildEntity(blueprints_1.HexagonBlueprint);
        var positionComponent = hexagaon.getComponent(components_1.PositionComponent);
        var renderComponent = hexagaon.getComponent(components_1.RenderComponent);
        renderComponent.color = '#f8cd05';
        positionComponent.x = xOrigin;
        positionComponent.y = yOrigin;
        if (!reset) {
            engine.addEntity(hexagaon);
        }
        var distance = 100;
        for (var i = 0; i < 6; i++) {
            var hexagaon_1 = engine.buildEntity(blueprints_1.HexagonBlueprint);
            var positionComponent_1 = hexagaon_1.getComponent(components_1.PositionComponent);
            var angle = i * (Math.PI / 3) + Math.PI / 2;
            positionComponent_1.x = xOrigin + distance * Math.cos(angle);
            positionComponent_1.y = yOrigin + distance * Math.sin(angle);
            if (!reset) {
                engine.addEntity(hexagaon_1);
            }
        }
    };
    SceneCreatorSystem.prototype.generateCandidateAnswer = function (engine, xOrigin, yOrigin, reset) {
        var candidateAnswer = engine.buildEntity(blueprints_1.CandidateAnswerBlueprint);
        var positionComponent = candidateAnswer.getComponent(components_1.PositionComponent);
        var textComponent = candidateAnswer.getComponent(components_1.TextComponent);
        textComponent.text = 'test';
        positionComponent.x = xOrigin;
        positionComponent.y = yOrigin - 250;
        if (!reset) {
            engine.addEntity(candidateAnswer);
        }
    };
    return SceneCreatorSystem;
}(core_1.System));
exports.SceneCreatorSystem = SceneCreatorSystem;
//# sourceMappingURL=scene-creator.system.js.map