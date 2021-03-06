"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var UnaryOpPatcher_1 = require("./UnaryOpPatcher");
/**
 * Handles unary math operators, e.g. `+a`, `-a`, `~a`.
 */
var UnaryMathOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(UnaryMathOpPatcher, _super);
    function UnaryMathOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Math does not (usually) have side effects, as far as CoffeeScript is
     * concerned. It could trigger a `valueOf` call that could trigger arbitrary
     * code, but we ignore that possibility.
     */
    UnaryMathOpPatcher.prototype.isRepeatable = function () {
        return this.expression.isRepeatable();
    };
    return UnaryMathOpPatcher;
}(UnaryOpPatcher_1.default));
exports.default = UnaryMathOpPatcher;
