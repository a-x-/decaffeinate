import * as tslib_1 from "tslib";
import getEnclosingScopeBlock from '../../../utils/getEnclosingScopeBlock';
import notNull from '../../../utils/notNull';
import NodePatcher from './../../../patchers/NodePatcher';
var LoopPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(LoopPatcher, _super);
    function LoopPatcher(patcherContext, body) {
        var _this = _super.call(this, patcherContext) || this;
        _this._resultArrayBinding = null;
        _this._resultArrayElementBinding = null;
        _this.body = body;
        return _this;
    }
    LoopPatcher.prototype.initialize = function () {
        getEnclosingScopeBlock(this).markIIFEPatcherDescendant(this);
    };
    LoopPatcher.prototype.patchAsExpression = function () {
        var _this = this;
        // We're only patched as an expression due to a parent instructing us to,
        // and the indent level is more logically the indent level of our parent.
        var baseIndent = notNull(this.parent).getIndent(0);
        var iifeBodyIndent = this.getLoopIndent();
        if (this.body !== null) {
            this.body.setShouldPatchInline(false);
            this.body.setImplicitlyReturns();
            this.body.setIndent(this.getLoopBodyIndent());
        }
        var resultBinding = this.getResultArrayBinding();
        this.patchInIIFE(function () {
            _this.insert(_this.innerStart, "\n" + iifeBodyIndent + resultBinding + " = [];\n" + iifeBodyIndent);
            _this.patchAsStatement();
            _this.insert(_this.innerEnd, "\n" + iifeBodyIndent + "return " + resultBinding + ";\n" + baseIndent);
        });
    };
    /**
     * The first of three meaningful indentation levels for where we might want to
     * insert code.
     *
     * As an example, in this code:
     * a((() => {
     *   for (let i = 0; i < b.length; i++) {
     *     let val = b[i];
     *     if (val) {
     *       c;
     *     }
     *   )
     * })())
     *
     * - `getLoopIndent` returns the indentation of the `for`.
     * - `getOuterLoopBodyIndent` returns the indentation of the `if`.
     * - `getLoopBodyIndent` returns the indentation of `c`.
     *
     * However, these levels may change based on whether the loop has a condition,
     * and whether the loop is being formatted as an IIFE or as a regular loop
     * statement.
     *
     * We need to be especially careful about when to actually set the indentation
     * of existing code, since doing that too much can confuse magic-string. The
     * only code that actually is adjusted is the loop body (but only when it's
     * not an inline body), and this is done relatively early on in all cases.
     */
    LoopPatcher.prototype.getLoopIndent = function () {
        if (this.willPatchAsExpression()) {
            return notNull(this.parent).getIndent(1);
        }
        else {
            return this.getIndent();
        }
    };
    /**
     * @see getLoopIndent.
     */
    LoopPatcher.prototype.getOuterLoopBodyIndent = function () {
        return this.getLoopIndent() + this.getProgramIndentString();
    };
    /**
     * @see getLoopIndent.
     */
    LoopPatcher.prototype.getLoopBodyIndent = function () {
        throw this.error("'getLoopBodyIndent' must be overridden in subclasses");
    };
    /**
     * IIFE-style loop expressions should always be multi-line, even if the loop
     * body in CoffeeScript is inline. This means we need to use a different
     * patching strategy where we insert a newline in the proper place before
     * generating code around the body, then we need to directly create the
     * indentation just before patching the body.
     */
    LoopPatcher.prototype.patchPossibleNewlineAfterLoopHeader = function (loopHeaderEndIndex) {
        if (this.body && this.shouldConvertInlineBodyToNonInline()) {
            this.overwrite(loopHeaderEndIndex, this.body.contentStart, "\n");
        }
    };
    LoopPatcher.prototype.patchBody = function () {
        if (this.body) {
            if (this.shouldConvertInlineBodyToNonInline()) {
                this.body.insert(this.body.outerStart, this.getLoopBodyIndent());
            }
            this.body.patch({ leftBrace: false, rightBrace: false });
        }
    };
    LoopPatcher.prototype.shouldConvertInlineBodyToNonInline = function () {
        return this.willPatchAsExpression() && this.body !== null && this.body.node.inline;
    };
    LoopPatcher.prototype.canHandleImplicitReturn = function () {
        return this.willPatchAsIIFE();
    };
    LoopPatcher.prototype.willPatchAsIIFE = function () {
        throw this.error("'willPatchAsIIFE' must be overridden in subclasses");
    };
    /**
     * Most implicit returns cause program flow to break by using a `return`
     * statement, but we don't do that since we're just collecting values in
     * an array. This allows descendants who care about this to adjust their
     * behavior accordingly.
     */
    LoopPatcher.prototype.implicitReturnWillBreak = function () {
        return false;
    };
    /**
     * If this loop is used as an expression, then we need to collect all the
     * values of the statements in implicit-return position. If all the code paths
     * in our body are present, we can just add `result.push(…)` to all
     * implicit-return position statements. If not, we want those code paths to
     * result in adding `undefined` to the resulting array. The way we do that is
     * by creating an `item` local variable that we set in each code path, and
     * when the code exits through a missing code path (i.e. `if false then b`)
     * then `item` will naturally have the value `undefined` which we then push
     * at the end of the loop body.
     */
    LoopPatcher.prototype.patchImplicitReturnStart = function (patcher) {
        // Control flow statements like break and continue should be skipped.
        // Unlike some other control flow statements, CoffeeScript does not allow
        // them to be wrapped in parens, so we don't need to remove any parens here.
        if (!patcher.canPatchAsExpression()) {
            return;
        }
        patcher.setRequiresExpression();
        // `a + b` → `result.push(a + b`
        //            ^^^^^^^^^^^^
        this.insert(patcher.outerStart, this.getResultArrayBinding() + ".push(");
    };
    /**
     * @see patchImplicitReturnStart
     */
    LoopPatcher.prototype.patchImplicitReturnEnd = function (patcher) {
        if (!patcher.canPatchAsExpression()) {
            return;
        }
        this.insert(patcher.outerEnd, ")");
    };
    LoopPatcher.prototype.getEmptyImplicitReturnCode = function () {
        return this.getResultArrayBinding() + ".push(undefined)";
    };
    /**
     * @private
     */
    LoopPatcher.prototype.getResultArrayBinding = function () {
        if (!this._resultArrayBinding) {
            this._resultArrayBinding = this.claimFreeBinding('result');
        }
        return this._resultArrayBinding;
    };
    /**
     * @private
     */
    LoopPatcher.prototype.getResultArrayElementBinding = function () {
        if (!this._resultArrayElementBinding) {
            this._resultArrayElementBinding = this.claimFreeBinding('item');
        }
        return this._resultArrayElementBinding;
    };
    LoopPatcher.prototype.statementNeedsSemicolon = function () {
        return false;
    };
    return LoopPatcher;
}(NodePatcher));
export default LoopPatcher;
