import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import { traverse } from 'decaffeinate-parser';
import SharedBlockPatcher from '../../../patchers/SharedBlockPatcher';
import countVariableUsages from '../../../utils/countVariableUsages';
import notNull from '../../../utils/notNull';
import Scope from '../../../utils/Scope';
import FunctionPatcher from './FunctionPatcher';
import ReturnPatcher from './ReturnPatcher';
var BlockPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(BlockPatcher, _super);
    function BlockPatcher() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._iifePatcherDescendants = [];
        _this._explicitDeclarationsToAdd = [];
        return _this;
    }
    BlockPatcher.prototype.markIIFEPatcherDescendant = function (iifePatcher) {
        this._iifePatcherDescendants.push(iifePatcher);
    };
    /**
     * In some cases, CoffeeScript constructs must be turned into IIFEs, but also
     * have assignments within them. The assignments should be seen as belonging
     * to the outer function scope, not the IIFE function scope, so we need to
     * explicitly hoist any variables that could be affected.
     */
    BlockPatcher.prototype.initialize = function () {
        var e_1, _a;
        var _loop_1 = function (iifePatcher) {
            var e_2, _a;
            if (!iifePatcher.willPatchAsIIFE()) {
                return "continue";
            }
            // Use the scope code to find all assignments, including loop assignees,
            // destructuring, etc.
            var fakeScope = new Scope(iifePatcher.node);
            traverse(iifePatcher.node, function (child) {
                fakeScope.processNode(child);
            });
            try {
                for (var _b = tslib_1.__values(fakeScope.getOwnNames()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var name = _c.value;
                    if (countVariableUsages(this_1.node, name) > countVariableUsages(iifePatcher.node, name) &&
                        this_1._explicitDeclarationsToAdd.indexOf(name) === -1) {
                        this_1._explicitDeclarationsToAdd.push(name);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        };
        var this_1 = this;
        try {
            for (var _b = tslib_1.__values(this._iifePatcherDescendants), _c = _b.next(); !_c.done; _c = _b.next()) {
                var iifePatcher = _c.value;
                _loop_1(iifePatcher);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    BlockPatcher.prototype.canPatchAsExpression = function () {
        return (this._explicitDeclarationsToAdd.length === 0 &&
            this.statements.every(function (statement) { return statement.canPatchAsExpression(); }));
    };
    BlockPatcher.prototype.prefersToPatchAsExpression = function () {
        return (this.statements.length === 0 || (this.statements.length === 1 && this.statements[0].prefersToPatchAsExpression()));
    };
    BlockPatcher.prototype.setExpression = function (force) {
        if (force === void 0) { force = false; }
        var willPatchAsExpression = _super.prototype.setExpression.call(this, force);
        if (willPatchAsExpression && this.prefersToPatchAsExpression()) {
            this.statements.forEach(function (statement) { return statement.setExpression(); });
            return true;
        }
        return false;
    };
    BlockPatcher.prototype.setImplicitlyReturns = function () {
        // A block can have no statements if it only had a block comment.
        if (this.statements.length > 0) {
            this.statements[this.statements.length - 1].setImplicitlyReturns();
        }
    };
    /**
     * Force the patcher to treat the block as inline (semicolon-separated
     * statements) or not (newline-separated statements).
     */
    BlockPatcher.prototype.setShouldPatchInline = function (shouldPatchInline) {
        this.shouldPatchInline = shouldPatchInline;
    };
    BlockPatcher.prototype.patchAsStatement = function (_a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, _c = _b.leftBrace, leftBrace = _c === void 0 ? true : _c, _d = _b.rightBrace, rightBrace = _d === void 0 ? true : _d;
        // Blocks can be surrounded by parens in CS but not JS, so just remove any parens if they're
        // there. The range of the block will always include the parens themselves.
        if (this.statements.length > 0) {
            this.removeInitialAndFinalParens();
        }
        if (leftBrace) {
            this.insert(this.innerStart, '{');
        }
        if (this._explicitDeclarationsToAdd.length > 0) {
            this.insertStatementsAtIndex(["var " + this._explicitDeclarationsToAdd.join(', ') + ";"], 0);
        }
        var constructor = null;
        this.statements.forEach(function (statement, i, statements) {
            if (i === statements.length - 1 && _this.parent instanceof FunctionPatcher) {
                if (statement instanceof ReturnPatcher && !statement.expression) {
                    _this.removeFinalEmptyReturn(statement);
                    return;
                }
            }
            // If we see a constructor (which only happens when this is a class
            // block), defer it until the end. Its patching may need other class
            // keys to already be patched so that it can generate method binding
            // statements within the constructor.
            // Check against the 'Constructor' node type instead of doing
            // `instanceof` to avoid a circular import issue.
            if (statement.node.type === 'Constructor') {
                if (constructor) {
                    throw _this.error('Unexpectedly found two constructors in the same block.');
                }
                constructor = statement;
            }
            else {
                _this.patchInnerStatement(statement);
            }
        });
        if (constructor) {
            this.patchInnerStatement(constructor);
        }
        if (rightBrace) {
            if (this.inline()) {
                this.insert(this.innerEnd, ' }');
            }
            else {
                this.appendLineAfter('}', -1);
            }
        }
    };
    BlockPatcher.prototype.removeInitialAndFinalParens = function () {
        var firstChild = this.statements[0];
        for (var tokenIndex = this.contentStartTokenIndex; tokenIndex !== null && tokenIndex.isBefore(firstChild.outerStartTokenIndex); tokenIndex = tokenIndex.next()) {
            var token = this.sourceTokenAtIndex(tokenIndex);
            if (token && token.type === SourceType.LPAREN) {
                this.remove(token.start, token.end);
            }
        }
        var lastChild = this.statements[this.statements.length - 1];
        for (var tokenIndex = this.contentEndTokenIndex; tokenIndex !== null && tokenIndex.isAfter(lastChild.outerEndTokenIndex); tokenIndex = tokenIndex.previous()) {
            var token = this.sourceTokenAtIndex(tokenIndex);
            if (token && token.type === SourceType.RPAREN) {
                this.remove(token.start, token.end);
            }
        }
    };
    BlockPatcher.prototype.patchInnerStatement = function (statement) {
        var hasImplicitReturn = statement.implicitlyReturns() && !statement.explicitlyReturns();
        if (statement.isSurroundedByParentheses() && !statement.statementNeedsParens() && !hasImplicitReturn) {
            this.remove(statement.outerStart, statement.innerStart);
            this.remove(statement.innerEnd, statement.outerEnd);
        }
        var implicitReturnPatcher = hasImplicitReturn ? this.implicitReturnPatcher() : null;
        if (implicitReturnPatcher) {
            implicitReturnPatcher.patchImplicitReturnStart(statement);
        }
        statement.patch();
        if (implicitReturnPatcher) {
            implicitReturnPatcher.patchImplicitReturnEnd(statement);
        }
        if (statement.statementNeedsSemicolon()) {
            this.insert(statement.outerEnd, ';');
        }
    };
    /**
     * Remove an unnecessary empty return at the end of a function. Ideally, we
     * want to remove the whole line, but that's only safe if the `return` is on a
     * line by itself. Otherwise, there might be bugs like code being pulled into
     * a comment on the previous line.
     */
    BlockPatcher.prototype.removeFinalEmptyReturn = function (statement) {
        var previousTokenIndex = statement.contentStartTokenIndex.previous();
        var nextTokenIndex = statement.contentEndTokenIndex.next();
        var previousToken = previousTokenIndex && this.sourceTokenAtIndex(previousTokenIndex);
        var nextToken = nextTokenIndex && this.sourceTokenAtIndex(nextTokenIndex);
        if (previousToken &&
            previousToken.type === SourceType.NEWLINE &&
            (!nextToken || nextToken.type === SourceType.NEWLINE)) {
            this.remove(previousToken.start, statement.outerEnd);
        }
        else if (previousToken && previousToken.type === SourceType.SEMICOLON) {
            this.remove(previousToken.start, statement.outerEnd);
        }
        else {
            this.remove(statement.outerStart, statement.outerEnd);
        }
    };
    BlockPatcher.prototype.patchAsExpression = function (_a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, _c = _b.leftBrace, leftBrace = _c === void 0 ? this.statements.length > 1 : _c, _d = _b.rightBrace, rightBrace = _d === void 0 ? this.statements.length > 1 : _d;
        if (leftBrace) {
            this.insert(this.innerStart, '(');
        }
        if (this.statements.length === 0) {
            this.insert(this.contentStart, 'undefined');
        }
        else {
            this.statements.forEach(function (statement, i, statements) {
                statement.setRequiresExpression();
                statement.patch();
                if (i !== statements.length - 1) {
                    var semicolonTokenIndex = _this.getSemicolonSourceTokenIndexBetween(statement, statements[i + 1]);
                    if (semicolonTokenIndex) {
                        var semicolonToken = notNull(_this.sourceTokenAtIndex(semicolonTokenIndex));
                        _this.overwrite(semicolonToken.start, semicolonToken.end, ',');
                    }
                    else {
                        _this.insert(statement.outerEnd, ',');
                    }
                }
            });
        }
        var lastToken = this.lastToken();
        if (lastToken.type === SourceType.SEMICOLON) {
            this.remove(lastToken.start, lastToken.end);
        }
        if (rightBrace) {
            this.insert(this.innerEnd, ')');
        }
    };
    /**
     * @private
     */
    BlockPatcher.prototype.getSemicolonSourceTokenIndexBetween = function (left, right) {
        return this.indexOfSourceTokenBetweenPatchersMatching(left, right, function (token) { return token.type === SourceType.SEMICOLON; });
    };
    /**
     * Blocks only exit via the last statement, so we check its code paths.
     */
    BlockPatcher.prototype.allCodePathsPresent = function () {
        return this.statements[this.statements.length - 1].allCodePathsPresent();
    };
    BlockPatcher.prototype.allowPatchingOuterBounds = function () {
        return true;
    };
    return BlockPatcher;
}(SharedBlockPatcher));
export default BlockPatcher;
