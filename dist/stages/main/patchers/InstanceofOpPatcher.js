"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NegatableBinaryOpPatcher_1 = require("./NegatableBinaryOpPatcher");
/**
 * Handles `instanceof` operator, e.g. `a instanceof b`.
 */
var InstanceofOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(InstanceofOpPatcher, _super);
    function InstanceofOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InstanceofOpPatcher.prototype.javaScriptOperator = function () {
        return 'instanceof';
    };
    return InstanceofOpPatcher;
}(NegatableBinaryOpPatcher_1.default));
exports.default = InstanceofOpPatcher;
