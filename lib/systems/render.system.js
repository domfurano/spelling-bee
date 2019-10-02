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
var point_1 = require("../model/point");
var RenderSystem = (function (_super) {
    __extends(RenderSystem, _super);
    function RenderSystem() {
        var _this = _super.call(this) || this;
        _this.canvas = document.createElement('canvas');
        _this.canvas.id = 'canvas';
        _this.canvas.width = window.innerWidth;
        _this.canvas.height = window.innerHeight;
        document.body.appendChild(_this.canvas);
        _this.ctx = _this.canvas.getContext('2d');
        return _this;
    }
    RenderSystem.prototype.onAttach = function (engine) {
        _super.prototype.onAttach.call(this, engine);
        this.family = new core_1.FamilyBuilder(engine).include(components_1.PositionComponent, components_1.RenderComponent).build();
    };
    RenderSystem.prototype.update = function (engine, delta) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var _i = 0, _a = this.family.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            var position = entity.getComponent(components_1.PositionComponent);
            var render = entity.getComponent(components_1.RenderComponent);
            this.ctx.fillStyle = render.color;
            this.ctx.globalAlpha = render.opacity;
            if (entity.hasComponent(components_1.SizeComponent)) {
                var size = entity.getComponent(components_1.SizeComponent);
                this.ctx.beginPath();
                for (var i = 0; i < 7; i++) {
                    var x = position.x + size.value * Math.cos(i * (Math.PI / 3));
                    var y = position.y + size.value * Math.sin(i * (Math.PI / 3));
                    this.ctx.lineTo(x, y);
                    if (entity.hasComponent(components_1.InteractiveComponent)) {
                        var click = entity.getComponent(components_1.InteractiveComponent);
                        click.area.push(new point_1.Point(x, y));
                    }
                }
                this.ctx.fillStyle = render.color;
                if (entity.hasComponent(components_1.InteractiveComponent)) {
                    var click = entity.getComponent(components_1.InteractiveComponent);
                    if (click.mousedown) {
                        this.ctx.fillStyle = 'red';
                    }
                }
                this.ctx.closePath();
                this.ctx.fill();
            }
            if (entity.hasComponent(components_1.TextComponent)) {
                var text = entity.getComponent(components_1.TextComponent);
                this.ctx.font = text.font;
                this.ctx.fillStyle = text.color;
                this.ctx.textAlign = text.align;
                this.ctx.textBaseline = text.baseLine;
                this.ctx.fillText(text.text, position.x, position.y);
            }
        }
    };
    return RenderSystem;
}(core_1.System));
exports.RenderSystem = RenderSystem;
//# sourceMappingURL=render.system.js.map