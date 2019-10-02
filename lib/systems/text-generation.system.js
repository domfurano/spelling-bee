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
var components_1 = require("../components");
var TextGenerationSystem = (function (_super) {
    __extends(TextGenerationSystem, _super);
    function TextGenerationSystem() {
        var _this = _super.call(this) || this;
        _this.word = TextGenerationSystem.shuffleWord('ALCOVES');
        _this.canvas = document.getElementsByTagName('canvas')[0];
        _this.ctx = _this.canvas.getContext('2d');
        return _this;
    }
    TextGenerationSystem.prototype.onAttach = function (engine) {
        _super.prototype.onAttach.call(this, engine);
        this.family = new core_1.FamilyBuilder(engine).include(components_1.TextComponent, components_1.PositionComponent).build();
    };
    TextGenerationSystem.prototype.update = function (engine, delta) {
        for (var i = 0; i < this.family.entities.length; i++) {
            var entity = this.family.entities[i];
            if (entity.hasComponent(components_1.TextComponent)) {
                var text = entity.getComponent(components_1.TextComponent);
                text.text = this.word[i];
            }
        }
    };
    TextGenerationSystem.shuffleWord = function (word) {
        var array = word.split('');
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array.join('');
    };
    return TextGenerationSystem;
}(core_1.System));
exports.TextGenerationSystem = TextGenerationSystem;
//# sourceMappingURL=text-generation.system.js.map