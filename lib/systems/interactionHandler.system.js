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
var InteractionHandlerSystem = (function (_super) {
    __extends(InteractionHandlerSystem, _super);
    function InteractionHandlerSystem() {
        var _this = _super.call(this) || this;
        _this.clicks = [];
        _this.mouseDowns = [];
        _this.mouseUp = false;
        return _this;
    }
    InteractionHandlerSystem.prototype.onAttach = function (engine) {
        var _this = this;
        _super.prototype.onAttach.call(this, engine);
        this.family = new core_1.FamilyBuilder(engine).include(components_1.InteractiveComponent).build();
        var canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.addEventListener('click', function (event) {
                _this.clicks.push(new point_1.Point(event.clientX, event.clientY));
            });
            canvas.addEventListener('mousedown', function (event) {
                _this.mouseDowns.push(new point_1.Point(event.clientX, event.clientY));
                _this.mouseUp = false;
            });
            canvas.addEventListener('mouseup', function (event) {
                _this.mouseUp = true;
            });
        }
    };
    InteractionHandlerSystem.prototype.update = function (engine, delta) {
        for (var _i = 0, _a = this.family.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            for (var _b = 0, _c = this.clicks; _b < _c.length; _b++) {
                var click = _c[_b];
                var interactiveComponent = entity.getComponent(components_1.InteractiveComponent);
                var inside = InteractionHandlerSystem.insidePolygon(interactiveComponent.area, 6, click);
                if (inside) {
                    interactiveComponent.click = true;
                }
            }
            for (var _d = 0, _e = this.mouseDowns; _d < _e.length; _d++) {
                var mouseDown = _e[_d];
                var interactiveComponent = entity.getComponent(components_1.InteractiveComponent);
                var inside = InteractionHandlerSystem.insidePolygon(interactiveComponent.area, 6, mouseDown);
                if (inside && !this.mouseUp) {
                    interactiveComponent.mousedown = true;
                }
            }
        }
        this.clicks = [];
        this.mouseDowns = [];
    };
    InteractionHandlerSystem.insidePolygon = function (points, N, p) {
        var counter = 0;
        var i;
        var xInters;
        var p1;
        var p2;
        p1 = points[0];
        for (i = 1; i <= N; i++) {
            p2 = points[i % N];
            if (p.y > Math.min(p1.y, p2.y)) {
                if (p.y <= Math.max(p1.y, p2.y)) {
                    if (p.x <= Math.max(p1.x, p2.x)) {
                        if (p1.y != p2.y) {
                            xInters = (p.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
                            if (p1.x == p2.x || p.x <= xInters) {
                                counter++;
                            }
                        }
                    }
                }
            }
            p1 = p2;
        }
        return counter % 2 != 0;
    };
    return InteractionHandlerSystem;
}(core_1.System));
exports.InteractionHandlerSystem = InteractionHandlerSystem;
//# sourceMappingURL=interactionHandler.system.js.map