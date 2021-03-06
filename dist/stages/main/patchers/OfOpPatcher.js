"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var NegatableBinaryOpPatcher_1 = require("./NegatableBinaryOpPatcher");
/**
 * Handles `of` operators, e.g. `a of b` and `a not of b`.
 */
var OfOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(OfOpPatcher, _super);
    function OfOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OfOpPatcher.prototype.operatorTokenPredicate = function () {
        return function (token) { return token.type === coffee_lex_1.SourceType.RELATION; };
    };
    OfOpPatcher.prototype.javaScriptOperator = function () {
        return 'in';
    };
    return OfOpPatcher;
}(NegatableBinaryOpPatcher_1.default));
exports.default = OfOpPatcher;
