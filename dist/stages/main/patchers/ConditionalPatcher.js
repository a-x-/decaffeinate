"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var getEnclosingScopeBlock_1 = require("../../../utils/getEnclosingScopeBlock");
var notNull_1 = require("../../../utils/notNull");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var ConditionalPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ConditionalPatcher, _super);
    function ConditionalPatcher(patcherContext, condition, consequent, alternate) {
        var _this = _super.call(this, patcherContext) || this;
        _this.negated = false;
        _this.condition = condition;
        _this.consequent = consequent;
        _this.alternate = alternate;
        return _this;
    }
    ConditionalPatcher.prototype.initialize = function () {
        this.condition.setRequiresExpression();
        getEnclosingScopeBlock_1.default(this).markIIFEPatcherDescendant(this);
    };
    /**
     * Anything like `break`, `continue`, or `return` inside a conditional means
     * we can't even safely make it an IIFE.
     */
    ConditionalPatcher.prototype.canPatchAsExpression = function () {
        if (this.consequent && !this.consequent.canPatchAsExpression()) {
            return false;
        }
        if (this.alternate && !this.alternate.canPatchAsExpression()) {
            return false;
        }
        return true;
    };
    ConditionalPatcher.prototype.prefersToPatchAsExpression = function () {
        var _a = this, consequent = _a.consequent, alternate = _a.alternate;
        if (!consequent || !alternate) {
            return false;
        }
        return consequent.prefersToPatchAsExpression() && alternate.prefersToPatchAsExpression();
    };
    ConditionalPatcher.prototype.setExpression = function (force) {
        if (force === void 0) { force = false; }
        var willPatchAsExpression = _super.prototype.setExpression.call(this, force);
        if (willPatchAsExpression && this.willPatchAsTernary()) {
            if (this.consequent) {
                this.consequent.setRequiresExpression();
            }
            if (this.alternate) {
                this.alternate.setRequiresExpression();
            }
            return true;
        }
        return false;
    };
    ConditionalPatcher.prototype.negate = function () {
        this.negated = !this.negated;
    };
    ConditionalPatcher.prototype.willPatchAsTernary = function () {
        return (this.prefersToPatchAsExpression() ||
            (this.forcedToPatchAsExpression() &&
                (!this.consequent || this.consequent.prefersToPatchAsExpression()) &&
                (!this.alternate || this.alternate.prefersToPatchAsExpression())));
    };
    /**
     * @private
     */
    ConditionalPatcher.prototype.willPatchAsIIFE = function () {
        return !this.willPatchAsTernary() && this.forcedToPatchAsExpression();
    };
    ConditionalPatcher.prototype.patchAsExpression = function (_a) {
        var needsParens = (_a === void 0 ? {} : _a).needsParens;
        var addParens = this.negated || (needsParens && !this.isSurroundedByParentheses());
        // `if a then b` → `a then b`
        //  ^^^
        this.overwrite(this.contentStart, this.condition.outerStart, "" + (this.negated ? '!' : '') + (addParens ? '(' : ''));
        if (this.node.isUnless) {
            this.condition.negate();
        }
        this.condition.patch();
        var thenTokenIndex = this.getThenTokenIndex();
        if (thenTokenIndex) {
            var thenToken = notNull_1.default(this.sourceTokenAtIndex(thenTokenIndex));
            // `a then b` → `a ? b`
            //    ^^^^         ^
            this.overwrite(thenToken.start, thenToken.end, '?');
        }
        else {
            // `a b` → `a ? b`
            //           ^^
            this.insert(this.condition.outerEnd, ' ?');
        }
        var elseTokenIndex = this.getElseSourceTokenIndex();
        var elseToken = elseTokenIndex && this.sourceTokenAtIndex(elseTokenIndex);
        var _b = this, consequent = _b.consequent, alternate = _b.alternate;
        if (consequent && alternate) {
            if (!elseToken) {
                throw this.error('Expected else token in conditional.');
            }
            consequent.patch();
            // `a ? b else c` → `a ? b : c`
            this.overwrite(elseToken.start, elseToken.end, ':');
            alternate.patch();
        }
        else if (consequent && !alternate) {
            consequent.patch();
            // `a ? b` → `a ? b : undefined`
            if (elseToken !== null) {
                this.overwrite(elseToken.start, elseToken.end, ' : undefined');
            }
            else {
                this.insert(consequent.outerEnd, ' : undefined');
            }
        }
        else if (alternate) {
            if (!elseToken) {
                throw this.error('Expected else token in conditional.');
            }
            // We might have just a semicolon as the consequent. In that case, it will be null in the AST
            // but we will need to remove it.
            var semicolonTokenIndex = this.indexOfSourceTokenBetweenSourceIndicesMatching(this.condition.outerEnd, elseToken.start, function (token) { return token.type === coffee_lex_1.SourceType.SEMICOLON; });
            if (semicolonTokenIndex) {
                var semicolonToken = this.sourceTokenAtIndex(semicolonTokenIndex);
                if (semicolonToken) {
                    this.remove(semicolonToken.start, semicolonToken.end);
                }
            }
            this.overwrite(elseToken.start, elseToken.end, 'undefined :');
            alternate.patch();
        }
        else {
            if (elseToken !== null) {
                this.overwrite(elseToken.start, elseToken.end, 'undefined : undefined');
            }
            else {
                this.insert(this.condition.outerEnd, ' undefined : undefined');
            }
        }
        if (addParens) {
            this.insert(this.contentEnd, ')');
        }
    };
    ConditionalPatcher.prototype.patchAsForcedExpression = function () {
        if (this.willPatchAsTernary()) {
            // We didn't want to be an expression because we don't have an alternate,
            // which means that the alternate of a generated ternary would be
            // `undefined`, which is ugly (i.e. `if a then b` → `a ? b : undefined`).
            // TODO: Generate a `do` expression instead? (i.e. `do { if (a) { b; } }`)
            this.patchAsExpression();
        }
        else if (this.willPatchAsIIFE()) {
            this.patchAsIIFE();
        }
    };
    ConditionalPatcher.prototype.patchAsIIFE = function () {
        var _this = this;
        if (this.negated) {
            this.insert(this.innerStart, '!');
        }
        // We're only patched as an expression due to a parent instructing us to,
        // and the indent level is more logically the indent level of our parent.
        var baseIndent = notNull_1.default(this.parent).getIndent(0);
        var conditionIndent = notNull_1.default(this.parent).getIndent(1);
        if (this.consequent) {
            this.consequent.setShouldPatchInline(false);
            this.consequent.setImplicitlyReturns();
        }
        if (this.alternate) {
            this.alternate.setShouldPatchInline(false);
            this.alternate.setImplicitlyReturns();
        }
        this.patchInIIFE(function () {
            _this.insert(_this.innerStart, "\n" + conditionIndent);
            _this.patchAsStatement();
            _this.insert(_this.innerEnd, "\n" + baseIndent);
        });
    };
    ConditionalPatcher.prototype.canHandleImplicitReturn = function () {
        return this.willPatchAsIIFE();
    };
    ConditionalPatcher.prototype.patchAsStatement = function () {
        this.patchConditionForStatement();
        this.patchConsequentForStatement();
        this.patchAlternateForStatement();
    };
    /**
     * @private
     */
    ConditionalPatcher.prototype.patchConditionForStatement = function () {
        // `unless a` → `if a`
        //  ^^^^^^        ^^
        var ifToken = notNull_1.default(this.sourceTokenAtIndex(this.getIfSourceTokenIndex()));
        this.overwrite(ifToken.start, ifToken.end, 'if');
        var conditionHasParentheses = this.condition.isSurroundedByParentheses();
        if (!conditionHasParentheses) {
            // `if a` → `if (a`
            //              ^
            this.insert(this.condition.outerStart, '(');
        }
        if (this.node.isUnless) {
            this.condition.negate();
        }
        this.condition.patch({ needsParens: false });
        if (!conditionHasParentheses) {
            // `if (a` → `if (a)`
            //                  ^
            this.insert(this.condition.outerEnd, ')');
        }
        var thenTokenIndex = this.getThenTokenIndex();
        if (thenTokenIndex) {
            var thenToken = notNull_1.default(this.sourceTokenAtIndex(thenTokenIndex));
            // `if (a) then b` → `if (a) b`
            //         ^^^^^
            if (this.consequent) {
                this.remove(thenToken.start, this.consequent.outerStart);
            }
            else {
                this.remove(thenToken.start, thenToken.end);
            }
        }
    };
    /**
     * @private
     */
    ConditionalPatcher.prototype.patchConsequentForStatement = function () {
        this.insert(this.condition.outerEnd, ' {');
        if (this.alternate) {
            var elseTokenIndex = notNull_1.default(this.getElseSourceTokenIndex());
            var elseToken = notNull_1.default(this.sourceTokenAtIndex(elseTokenIndex));
            var rightBracePosition = elseToken.start;
            if (this.consequent !== null) {
                this.consequent.patch({ leftBrace: false, rightBrace: false });
            }
            this.insert(rightBracePosition, '} ');
        }
        else {
            if (this.consequent !== null) {
                this.consequent.patch({ leftBrace: false });
            }
            else {
                this.insert(this.condition.outerEnd, '} ');
            }
        }
    };
    /**
     * @private
     */
    ConditionalPatcher.prototype.patchAlternateForStatement = function () {
        var elseTokenIndex = this.getElseSourceTokenIndex();
        if (this.alternate && elseTokenIndex) {
            var ifToken = this.sourceTokenAtIndex(notNull_1.default(elseTokenIndex.next()));
            var isElseIf = ifToken ? ifToken.type === coffee_lex_1.SourceType.IF : false;
            if (isElseIf) {
                // Let the nested ConditionalPatcher handle braces.
                this.alternate.patch({ leftBrace: false, rightBrace: false });
            }
            else {
                var elseToken = notNull_1.default(this.sourceTokenAtIndex(elseTokenIndex));
                var leftBracePosition = elseToken.end;
                this.insert(leftBracePosition, ' {');
                this.alternate.patch({ leftBrace: false });
            }
        }
        else if (elseTokenIndex !== null) {
            var elseToken = notNull_1.default(this.sourceTokenAtIndex(elseTokenIndex));
            this.insert(elseToken.end, ' {}');
        }
        else if (_super.prototype.implicitlyReturns.call(this)) {
            var emptyImplicitReturnCode = this.implicitReturnPatcher().getEmptyImplicitReturnCode();
            if (emptyImplicitReturnCode) {
                this.insert(this.innerEnd, ' else {\n');
                this.insert(this.innerEnd, "" + this.getIndent(1) + emptyImplicitReturnCode + "\n");
                this.insert(this.innerEnd, this.getIndent() + "}");
            }
        }
    };
    /**
     * If we ended up as a statement, then we know our children are set as
     * implicit return nodes, so no need to turn the conditional into an
     * expression for implicit return purposes.
     */
    ConditionalPatcher.prototype.implicitlyReturns = function () {
        return _super.prototype.implicitlyReturns.call(this) && this.willPatchAsExpression();
    };
    ConditionalPatcher.prototype.setImplicitlyReturns = function () {
        _super.prototype.setImplicitlyReturns.call(this);
        if (this.consequent) {
            this.consequent.setImplicitlyReturns();
        }
        if (this.alternate) {
            this.alternate.setImplicitlyReturns();
        }
    };
    /**
     * Conditionals do not need semicolons when used as statements.
     */
    ConditionalPatcher.prototype.statementNeedsSemicolon = function () {
        return false;
    };
    /**
     * Gets the index of the token representing the `if` at the start.
     *
     * @private
     */
    ConditionalPatcher.prototype.getIfSourceTokenIndex = function () {
        var ifTokenIndex = this.indexOfSourceTokenStartingAtSourceIndex(this.contentStart);
        if (!ifTokenIndex) {
            throw this.error('expected IF token at start of conditional');
        }
        var ifToken = notNull_1.default(this.sourceTokenAtIndex(ifTokenIndex));
        if (ifToken.type !== coffee_lex_1.SourceType.IF) {
            throw this.error("expected IF token at start of conditional, but got " + coffee_lex_1.SourceType[ifToken.type]);
        }
        return ifTokenIndex;
    };
    /**
     * Gets the index of the token representing the `else` between consequent and
     * alternate.
     *
     * @private
     */
    ConditionalPatcher.prototype.getElseSourceTokenIndex = function () {
        var elseTokenIndex = this.indexOfSourceTokenBetweenSourceIndicesMatching(this.consequent !== null ? this.consequent.outerEnd : this.condition.outerEnd, this.alternate !== null ? this.alternate.outerStart : this.outerEnd, function (token) { return token.type === coffee_lex_1.SourceType.ELSE; });
        if (this.alternate !== null && !elseTokenIndex) {
            throw this.error('expected ELSE token between consequent and alternate', this.consequent !== null ? this.consequent.outerEnd : this.condition.outerEnd, this.alternate.outerStart);
        }
        return elseTokenIndex;
    };
    /**
     * Gets the index of the token representing the `then` between condition and
     * consequent.
     *
     * @private
     */
    ConditionalPatcher.prototype.getThenTokenIndex = function () {
        var searchEnd;
        if (this.consequent) {
            searchEnd = this.consequent.outerStart;
        }
        else if (this.alternate) {
            searchEnd = this.alternate.outerStart;
        }
        else {
            var nextToken = this.nextSemanticToken();
            if (nextToken) {
                searchEnd = nextToken.end;
            }
            else {
                searchEnd = this.contentEnd;
            }
        }
        return this.indexOfSourceTokenBetweenSourceIndicesMatching(this.condition.outerEnd, searchEnd, function (token) { return token.type === coffee_lex_1.SourceType.THEN; });
    };
    /**
     * Conditionals have all code paths if there is an `else` and both the
     * consequent and alternate have all their code paths.
     */
    ConditionalPatcher.prototype.allCodePathsPresent = function () {
        if (!this.consequent || !this.alternate) {
            return false;
        }
        return this.consequent.allCodePathsPresent() && this.alternate.allCodePathsPresent();
    };
    return ConditionalPatcher;
}(NodePatcher_1.default));
exports.default = ConditionalPatcher;
