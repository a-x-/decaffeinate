"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var notNull_1 = require("../../../utils/notNull");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var MemberAccessOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(MemberAccessOpPatcher, _super);
    function MemberAccessOpPatcher(patcherContext, expression, member) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        _this.member = member;
        _this._skipImplicitDotCreation = false;
        return _this;
    }
    MemberAccessOpPatcher.prototype.initialize = function () {
        this.expression.setRequiresExpression();
    };
    MemberAccessOpPatcher.prototype.setSkipImplicitDotCreation = function () {
        this._skipImplicitDotCreation = true;
    };
    MemberAccessOpPatcher.prototype.patchAsExpression = function () {
        if (this.lhsNeedsParens()) {
            this.insert(this.expression.outerStart, '(');
        }
        this.expression.patch();
        if (this.lhsNeedsParens()) {
            this.insert(this.expression.outerEnd, ')');
        }
        if (this.hasImplicitOperator() && !this._skipImplicitDotCreation) {
            // `@a` → `@.a`
            //          ^
            this.insert(this.expression.outerEnd, '.');
        }
    };
    /**
     * We can make member accesses repeatable by making the base expression
     * repeatable if it isn't already.
     */
    MemberAccessOpPatcher.prototype.patchAsRepeatableExpression = function (repeatableOptions, patchOptions) {
        if (repeatableOptions === void 0) { repeatableOptions = {}; }
        if (patchOptions === void 0) { patchOptions = {}; }
        // eslint-disable-line no-unused-vars
        if (repeatableOptions.isForAssignment) {
            this.expression.setRequiresRepeatableExpression({ isForAssignment: true, parens: true, ref: 'base' });
            this.patchAsExpression();
            this.commitDeferredSuffix();
            return this.expression.getRepeatCode() + "." + this.getFullMemberName();
        }
        else {
            return _super.prototype.patchAsRepeatableExpression.call(this, repeatableOptions, patchOptions);
        }
    };
    MemberAccessOpPatcher.prototype.hasImplicitOperator = function () {
        return !this.getMemberOperatorSourceToken();
    };
    MemberAccessOpPatcher.prototype.getMemberOperatorSourceToken = function () {
        var dotIndex = this.indexOfSourceTokenBetweenSourceIndicesMatching(this.expression.outerEnd, this.outerEnd - 1, function (token) { return token.type === coffee_lex_1.SourceType.DOT; });
        if (!dotIndex) {
            var firstIndex = this.contentStartTokenIndex;
            var firstToken = notNull_1.default(this.sourceTokenAtIndex(firstIndex));
            if (firstToken.type === coffee_lex_1.SourceType.AT) {
                // e.g. `@a`, so it's okay that there's no dot
                return null;
            }
            throw this.error("cannot find '.' in member access");
        }
        // e.g. `a.b`
        return this.sourceTokenAtIndex(dotIndex);
    };
    MemberAccessOpPatcher.prototype.getMemberName = function () {
        return this.node.member.data;
    };
    MemberAccessOpPatcher.prototype.getFullMemberName = function () {
        return this.getMemberName();
    };
    MemberAccessOpPatcher.prototype.getMemberNameSourceToken = function () {
        var tokens = this.context.sourceTokens;
        var index = tokens.lastIndexOfTokenMatchingPredicate(function (token) { return token.type === coffee_lex_1.SourceType.IDENTIFIER; }, this.contentEndTokenIndex);
        if (!index || index.isBefore(this.contentStartTokenIndex)) {
            throw this.error("unable to find member name token in access");
        }
        return notNull_1.default(tokens.tokenAtIndex(index));
    };
    /**
     * Member access is repeatable (in CoffeeScript) if the expression we're
     * accessing a member of is also repeatable. Technically speaking even this is
     * not safe since member access can have side-effects via getters and setters,
     * but this is the way the official CoffeeScript compiler works so we follow
     * suit.
     */
    MemberAccessOpPatcher.prototype.isRepeatable = function () {
        return this.expression.isRepeatable();
    };
    /**
     * If `BASE` needs parens, then `BASE.MEMBER` needs parens.
     */
    MemberAccessOpPatcher.prototype.statementNeedsParens = function () {
        return this.expression.statementShouldAddParens();
    };
    MemberAccessOpPatcher.prototype.lhsNeedsParens = function () {
        return this.expression.node.type === 'Int';
    };
    return MemberAccessOpPatcher;
}(NodePatcher_1.default));
exports.default = MemberAccessOpPatcher;
