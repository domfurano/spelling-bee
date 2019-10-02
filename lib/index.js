"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@mesa-engine/core");
var s = require("./systems");
var App = (function () {
    function App() {
        var _a;
        this.lastRender = 0;
        this.engine = new core_1.Engine();
        (_a = this.engine).addSystems.apply(_a, Object.keys(s).map(function (system) { return new s[system](); }));
        window.requestAnimationFrame(this.loop.bind(this));
    }
    App.prototype.loop = function (timestamp) {
        var progress = timestamp - this.lastRender;
        this.engine.update(progress);
        this.lastRender = timestamp;
        window.requestAnimationFrame(this.loop.bind(this));
    };
    return App;
}());
exports.App = App;
new App();
//# sourceMappingURL=index.js.map