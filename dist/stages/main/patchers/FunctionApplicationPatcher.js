"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var types_1 = require("../../../utils/types");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var FunctionApplicationPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(FunctionApplicationPatcher, _super);
    function FunctionApplicationPatcher(patcherContext, fn, args) {
        var _this = _super.call(this, patcherContext) || this;
        _this.fn = fn;
        _this.args = args;
        return _this;
    }
    FunctionApplicationPatcher.prototype.initialize = function () {
        this.fn.setRequiresExpression();
        this.args.forEach(function (arg) { return arg.setRequiresExpression(); });
    };
    /**
     * Note that we don't need to worry about implicit function applications,
     * since the normalize stage would have already added parens.
     */
    FunctionApplicationPatcher.prototype.patchAsExpression = function (_a) {
        var _this = this;
        var _b = (_a === void 0 ? {} : _a).fnNeedsParens, fnNeedsParens = _b === void 0 ? false : _b;
        var _c = this, args = _c.args, outerEndTokenIndex = _c.outerEndTokenIndex;
        if (fnNeedsParens) {
            this.insert(this.fn.outerStart, '(');
        }
        this.fn.patch({ skipParens: fnNeedsParens });
        if (fnNeedsParens) {
            this.insert(this.fn.outerEnd, ')');
        }
        args.forEach(function (arg, i) {
            arg.patch();
            var isLast = i === args.length - 1;
            var commaTokenIndex = _this.indexOfSourceTokenAfterSourceTokenIndex(arg.outerEndTokenIndex, coffee_lex_1.SourceType.COMMA, types_1.isSemanticToken);
            // Ignore commas after the end of the function call.
            if (commaTokenIndex && commaTokenIndex.compare(outerEndTokenIndex) <= 0) {
                commaTokenIndex = null;
            }
            var commaToken = commaTokenIndex && _this.sourceTokenAtIndex(commaTokenIndex);
            if (isLast && commaToken) {
                _this.remove(arg.outerEnd, commaToken.end);
            }
            else if (!isLast && !commaToken) {
                _this.insert(arg.outerEnd, ',');
            }
        });
    };
    /**
     * Probably can't happen, but just for completeness.
     */
    FunctionApplicationPatcher.prototype.statementNeedsParens = function () {
        return this.fn.statementShouldAddParens();
    };
    return FunctionApplicationPatcher;
}(NodePatcher_1.default));
exports.default = FunctionApplicationPatcher;
