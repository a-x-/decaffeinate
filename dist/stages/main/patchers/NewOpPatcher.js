"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var FunctionApplicationPatcher_1 = require("./FunctionApplicationPatcher");
var IdentifierPatcher_1 = require("./IdentifierPatcher");
var MemberAccessOpPatcher_1 = require("./MemberAccessOpPatcher");
/**
 * Handles construction of objects with `new`.
 */
var NewOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(NewOpPatcher, _super);
    function NewOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NewOpPatcher.prototype.patchAsExpression = function () {
        var fnNeedsParens = !this.fn.isSurroundedByParentheses() &&
            !(this.fn instanceof IdentifierPatcher_1.default) &&
            !(this.fn instanceof MemberAccessOpPatcher_1.default);
        _super.prototype.patchAsExpression.call(this, { fnNeedsParens: fnNeedsParens });
    };
    return NewOpPatcher;
}(FunctionApplicationPatcher_1.default));
exports.default = NewOpPatcher;
