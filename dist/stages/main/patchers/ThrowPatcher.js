"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var notNull_1 = require("../../../utils/notNull");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var ThrowPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ThrowPatcher, _super);
    function ThrowPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        return _this;
    }
    ThrowPatcher.prototype.initialize = function () {
        this.expression.setRequiresExpression();
    };
    /**
     * Throw in JavaScript is a statement only, so we'd prefer it stay that way.
     */
    ThrowPatcher.prototype.prefersToPatchAsExpression = function () {
        return false;
    };
    /**
     * Throw statements that are in the implicit return position should simply
     * be left alone as they're pure statements in JS and don't have a value.
     */
    ThrowPatcher.prototype.setImplicitlyReturns = function () {
        // throw can't be an implicit return
    };
    /**
     * `throw` statements cannot normally be used as expressions, so we wrap them
     * in an arrow function IIFE.
     */
    ThrowPatcher.prototype.patchAsExpression = function () {
        var hasParens = this.isSurroundedByParentheses();
        if (!hasParens) {
            // `throw err` → `(throw err`
            //                ^
            this.insert(this.outerStart, '(');
        }
        // `(throw err` → `(() => { throw err`
        //                  ^^^^^^^^
        this.insert(this.innerStart, '() => { ');
        this.patchAsStatement();
        // `(() => { throw err` → `(() => { throw err }`
        //                                           ^^
        this.insert(this.innerEnd, ' }');
        if (!hasParens) {
            // `(() => { throw err }` → `(() => { throw err })`
            //                                               ^
            this.insert(this.outerEnd, ')');
        }
        // `(() => { throw err })` → `(() => { throw err })()`
        //                                                 ^^
        this.insert(this.outerEnd, '()');
    };
    ThrowPatcher.prototype.patchAsStatement = function () {
        var throwToken = notNull_1.default(this.sourceTokenAtIndex(this.contentStartTokenIndex));
        if (throwToken.type !== coffee_lex_1.SourceType.THROW) {
            throw this.error('Expected to find throw token at the start of throw statement.');
        }
        var spacing = this.slice(throwToken.end, this.expression.outerStart);
        if (spacing.indexOf('\n') !== -1) {
            this.overwrite(throwToken.end, this.expression.outerStart, ' ');
        }
        this.expression.patch();
    };
    /**
     * This is here so that we can add the `()` outside any existing parens.
     */
    ThrowPatcher.prototype.allowPatchingOuterBounds = function () {
        return true;
    };
    return ThrowPatcher;
}(NodePatcher_1.default));
exports.default = ThrowPatcher;
