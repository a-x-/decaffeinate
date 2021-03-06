"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var notNull_1 = require("../../../utils/notNull");
var BlockPatcher_1 = require("./BlockPatcher");
var BreakPatcher_1 = require("./BreakPatcher");
var SwitchCasePatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SwitchCasePatcher, _super);
    function SwitchCasePatcher(patcherContext, conditions, consequent) {
        var _this = _super.call(this, patcherContext) || this;
        _this.conditions = conditions;
        _this.consequent = consequent;
        _this.negated = false;
        return _this;
    }
    SwitchCasePatcher.prototype.initialize = function () {
        this.conditions.forEach(function (condition) { return condition.setRequiresExpression(); });
    };
    SwitchCasePatcher.prototype.patchAsStatement = function () {
        var _this = this;
        var lastCondition = this.conditions[this.conditions.length - 1];
        // `when a, b, c then d` → `a, b, c then d`
        //  ^^^^^
        var whenToken = this.getWhenToken();
        this.remove(whenToken.start, this.conditions[0].outerStart);
        // `a, b, c then d` → `a b c then d`
        //   ^  ^
        this.getCommaTokens().forEach(function (comma) {
            _this.remove(comma.start, comma.end);
        });
        this.conditions.forEach(function (condition) {
            // `a b c then d` → `case a: case b: case c: then d`
            //                   ^^^^^ ^^^^^^^ ^^^^^^^ ^
            _this.insert(condition.outerStart, 'case ');
            if (_this.negated) {
                condition.negate();
            }
            condition.patch({ leftBrace: false, rightBrace: false });
            _this.insert(condition.outerEnd, ':');
        });
        // `case a: case b: case c: then d → `case a: case b: case c: d`
        //                          ^^^^^
        var thenToken = this.getThenToken();
        if (thenToken) {
            if (this.consequent !== null) {
                this.remove(thenToken.start, this.consequent.outerStart);
            }
            else {
                this.remove(lastCondition.outerEnd, thenToken.end);
            }
        }
        if (this.consequent !== null) {
            this.consequent.patch({ leftBrace: false, rightBrace: false });
        }
        var implicitReturnWillBreak = this.implicitlyReturns() &&
            this.implicitReturnPatcher().implicitReturnWillBreak() &&
            (!this.consequent || this.consequent.allCodePathsPresent());
        var shouldAddBreak = !this.hasExistingBreak() && !implicitReturnWillBreak;
        if (shouldAddBreak) {
            if (thenToken) {
                // `case a: case b: case c: then d → `case a: case b: case c: d break`
                //                                                             ^^^^^^
                if (this.consequent !== null) {
                    this.insert(this.consequent.contentEnd, ' break');
                }
                else {
                    this.insert(lastCondition.outerEnd, "\n" + this.getIndent(1) + "break");
                }
            }
            else {
                this.appendLineAfter('break', 1);
            }
        }
    };
    SwitchCasePatcher.prototype.setImplicitlyReturns = function () {
        _super.prototype.setImplicitlyReturns.call(this);
        if (this.consequent !== null) {
            this.consequent.setImplicitlyReturns();
        }
    };
    SwitchCasePatcher.prototype.patchAsExpression = function () {
        this.patchAsStatement();
    };
    /**
     * Don't actually negate the conditions until just before patching, since
     * otherwise we might accidentally overwrite a ! character that gets inserted.
     */
    SwitchCasePatcher.prototype.negate = function () {
        this.negated = !this.negated;
    };
    /**
     * @private
     */
    SwitchCasePatcher.prototype.getWhenToken = function () {
        var whenToken = this.sourceTokenAtIndex(this.contentStartTokenIndex);
        if (!whenToken) {
            throw this.error("bad token index for start of 'when'");
        }
        if (whenToken.type !== coffee_lex_1.SourceType.WHEN) {
            throw this.error("unexpected " + coffee_lex_1.SourceType[whenToken.type] + " at start of 'switch' case");
        }
        return whenToken;
    };
    /**
     * @private
     */
    SwitchCasePatcher.prototype.getCommaTokens = function () {
        var result = [];
        for (var i = 1; i < this.conditions.length; i++) {
            var left = this.conditions[i - 1];
            var right = this.conditions[i];
            var commaIndex = this.indexOfSourceTokenBetweenPatchersMatching(left, right, function (token) { return token.type === coffee_lex_1.SourceType.COMMA; });
            if (!commaIndex) {
                throw this.error("unable to find comma between 'when' conditions", left.contentEnd, right.contentStart);
            }
            result.push(notNull_1.default(this.sourceTokenAtIndex(commaIndex)));
        }
        return result;
    };
    /**
     * @private
     */
    SwitchCasePatcher.prototype.hasExistingBreak = function () {
        if (!(this.consequent instanceof BlockPatcher_1.default)) {
            return false;
        }
        var lastStatement = this.consequent.statements[this.consequent.statements.length - 1];
        return lastStatement && lastStatement instanceof BreakPatcher_1.default;
    };
    /**
     * Gets the token representing the `then` between condition and consequent.
     *
     * @private
     */
    SwitchCasePatcher.prototype.getThenToken = function () {
        var thenTokenIndex = this.indexOfSourceTokenBetweenSourceIndicesMatching(this.conditions[0].outerEnd, this.consequent !== null ? this.consequent.outerStart : this.contentEnd, function (token) { return token.type === coffee_lex_1.SourceType.THEN; });
        if (thenTokenIndex) {
            return this.sourceTokenAtIndex(thenTokenIndex);
        }
        // In some cases, the node bounds are wrong and the `then` is after our
        // current node, so just use that.
        var nextToken = this.nextSemanticToken();
        if (nextToken && nextToken.type === coffee_lex_1.SourceType.THEN) {
            return nextToken;
        }
        return null;
    };
    return SwitchCasePatcher;
}(NodePatcher_1.default));
exports.default = SwitchCasePatcher;
