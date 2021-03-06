import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import NodePatcher from '../../../patchers/NodePatcher';
import getEnclosingScopeBlock from '../../../utils/getEnclosingScopeBlock';
var SwitchPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SwitchPatcher, _super);
    function SwitchPatcher(patcherContext, expression, cases, alternate) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        _this.cases = cases;
        _this.alternate = alternate;
        return _this;
    }
    SwitchPatcher.prototype.initialize = function () {
        if (this.expression) {
            this.expression.setRequiresExpression();
        }
        getEnclosingScopeBlock(this).markIIFEPatcherDescendant(this);
    };
    SwitchPatcher.prototype.prefersToPatchAsExpression = function () {
        return false;
    };
    SwitchPatcher.prototype.patchAsStatement = function () {
        if (this.expression) {
            // `switch a` → `switch (a`
            //                      ^
            if (!this.expression.isSurroundedByParentheses()) {
                this.insert(this.expression.contentStart, '(');
            }
            this.expression.patch();
            // `switch (a` → `switch (a)`
            //                         ^
            if (!this.expression.isSurroundedByParentheses()) {
                this.insert(this.expression.contentEnd, ')');
            }
            // `switch (a)` → `switch (a) {`
            //                            ^
            this.insert(this.expression.outerEnd, ' {');
        }
        else {
            this.cases.forEach(function (casePatcher) { return casePatcher.negate(); });
            // `switch` → `switch (false) {`
            //                   ^^^^^^^^^^
            var switchToken = this.getSwitchToken();
            this.insert(switchToken.end, ' (false) {');
        }
        this.cases.forEach(function (casePatcher) { return casePatcher.patch(); });
        this.overwriteElse();
        if (this.alternate) {
            this.alternate.patch({ leftBrace: false, rightBrace: false });
        }
        else if (this.getElseToken() === null && _super.prototype.implicitlyReturns.call(this)) {
            var emptyImplicitReturnCode = this.implicitReturnPatcher().getEmptyImplicitReturnCode();
            if (emptyImplicitReturnCode) {
                this.insert(this.contentEnd, "\n");
                this.insert(this.contentEnd, this.getIndent(1) + "default:\n");
                this.insert(this.contentEnd, "" + this.getIndent(2) + emptyImplicitReturnCode);
            }
        }
        this.appendLineAfter('}');
    };
    /**
     * If we're a statement, our children can handle implicit return, so no need
     * to convert to an expression.
     */
    SwitchPatcher.prototype.implicitlyReturns = function () {
        return _super.prototype.implicitlyReturns.call(this) && this.willPatchAsExpression();
    };
    SwitchPatcher.prototype.setImplicitlyReturns = function () {
        _super.prototype.setImplicitlyReturns.call(this);
        this.cases.forEach(function (casePatcher) { return casePatcher.setImplicitlyReturns(); });
        if (this.alternate) {
            this.alternate.setImplicitlyReturns();
        }
    };
    SwitchPatcher.prototype.patchAsExpression = function () {
        var _this = this;
        this.setImplicitlyReturns();
        this.patchInIIFE(function () {
            _this.insert(_this.innerStart, ' ');
            _this.patchAsStatement();
            _this.insert(_this.innerEnd, ' ');
        });
    };
    SwitchPatcher.prototype.willPatchAsIIFE = function () {
        return this.willPatchAsExpression();
    };
    SwitchPatcher.prototype.canHandleImplicitReturn = function () {
        return this.willPatchAsExpression();
    };
    /**
     * @private
     */
    SwitchPatcher.prototype.overwriteElse = function () {
        // `else` → `default:`
        //           ^^^^^^^^
        var elseToken = this.getElseToken();
        if (elseToken) {
            this.overwrite(elseToken.start, elseToken.end, 'default:');
        }
    };
    /**
     * @private
     */
    SwitchPatcher.prototype.getElseToken = function () {
        var searchStart;
        if (this.cases.length > 0) {
            searchStart = this.cases[this.cases.length - 1].outerEnd;
        }
        else {
            searchStart = this.expression.outerEnd;
        }
        var searchEnd;
        if (this.alternate) {
            searchEnd = this.alternate.outerStart;
        }
        else {
            searchEnd = this.contentEnd;
        }
        var elseTokenIndex = this.indexOfSourceTokenBetweenSourceIndicesMatching(searchStart, searchEnd, function (token) { return token.type === SourceType.ELSE; });
        if (!elseTokenIndex || elseTokenIndex.isBefore(this.contentStartTokenIndex)) {
            if (this.alternate) {
                throw this.alternate.error("no ELSE token found before 'switch' alternate");
            }
            else {
                return null;
            }
        }
        return this.sourceTokenAtIndex(elseTokenIndex);
    };
    /**
     * @private
     */
    SwitchPatcher.prototype.getSwitchToken = function () {
        var switchToken = this.sourceTokenAtIndex(this.contentStartTokenIndex);
        if (!switchToken) {
            throw this.error("bad token index for start of 'switch'");
        }
        if (switchToken.type !== SourceType.SWITCH) {
            throw this.error("unexpected " + SourceType[switchToken.type] + " token at start of 'switch'");
        }
        return switchToken;
    };
    /**
     * Switch statements with all code paths present have a `default` case and
     * each case has all of its code paths covered.
     */
    SwitchPatcher.prototype.allCodePathsPresent = function () {
        if (!this.alternate) {
            return false;
        }
        return this.cases.every(function (switchCase) { return switchCase.allCodePathsPresent(); }) && this.alternate.allCodePathsPresent();
    };
    return SwitchPatcher;
}(NodePatcher));
export default SwitchPatcher;
