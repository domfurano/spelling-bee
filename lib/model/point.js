"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Point = (function () {
    function Point(x, y) {
        this._x = x;
        this._y = y;
    }
    Object.defineProperty(Point.prototype, "x", {
        get: function () {
            return this._x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Point.prototype, "y", {
        get: function () {
            return this._y;
        },
        enumerable: true,
        configurable: true
    });
    Point.prototype.toString = function () {
        return '{ ' + this.x + ', ' + this.y + ' }';
    };
    return Point;
}());
exports.Point = Point;
//# sourceMappingURL=point.js.map