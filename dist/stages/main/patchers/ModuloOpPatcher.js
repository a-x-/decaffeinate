"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var registerModHelper_1 = require("../../../utils/registerModHelper");
var BinaryOpPatcher_1 = require("./BinaryOpPatcher");
var ModuloOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ModuloOpPatcher, _super);
    /**
     * `node` is of type `ModuloOp`.
     */
    function ModuloOpPatcher(patcherContext, left, right) {
        return _super.call(this, patcherContext, left, right) || this;
    }
    ModuloOpPatcher.prototype.patchAsExpression = function () {
        var helper = registerModHelper_1.default(this);
        // `a %% b` → `__mod__(a %% b`
        //             ^^^^^^^^
        this.insert(this.left.outerStart, helper + "(");
        this.left.patch();
        // `__mod__(a %% b` → `__mod__(a, b`
        //           ^^^^               ^^
        this.overwrite(this.left.outerEnd, this.right.outerStart, ', ');
        this.right.patch();
        // `__mod__(a, b` → `__mod__(a, b)`
        //                               ^
        this.insert(this.right.outerEnd, ')');
    };
    /**
     * We always prefix with `__mod__` so no parens needed.
     */
    ModuloOpPatcher.prototype.statementNeedsParens = function () {
        return false;
    };
    return ModuloOpPatcher;
}(BinaryOpPatcher_1.default));
exports.default = ModuloOpPatcher;
