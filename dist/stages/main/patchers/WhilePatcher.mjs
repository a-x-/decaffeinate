import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import notNull from '../../../utils/notNull';
import LoopPatcher from './LoopPatcher';
/**
 * Handles `while` loops, e.g.
 *
 *   while a
 *     b
 */
var WhilePatcher = /** @class */ (function (_super) {
    tslib_1.__extends(WhilePatcher, _super);
    function WhilePatcher(patcherContext, condition, guard, body) {
        var _this = _super.call(this, patcherContext, body) || this;
        _this.condition = condition;
        _this.guard = guard;
        return _this;
    }
    WhilePatcher.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.condition.setRequiresExpression();
        if (this.guard !== null) {
            this.guard.setRequiresExpression();
        }
    };
    /**
     * ( 'while' | 'until' ) CONDITION ('when' GUARD)? 'then' BODY
     * ( 'while' | 'until' ) CONDITION ('when' GUARD)? NEWLINE INDENT BODY
     */
    WhilePatcher.prototype.patchAsStatement = function () {
        if (this.body && !this.body.inline()) {
            this.body.setIndent(this.getLoopBodyIndent());
        }
        // `until a` → `while a`
        //  ^^^^^       ^^^^^
        var whileToken = notNull(this.sourceTokenAtIndex(this.getWhileTokenIndex()));
        this.overwrite(whileToken.start, whileToken.end, 'while');
        var conditionNeedsParens = !this.condition.isSurroundedByParentheses();
        if (conditionNeedsParens) {
            // `while a` → `while (a`
            //                    ^
            this.insert(this.condition.outerStart, '(');
        }
        if (this.node.isUntil) {
            this.condition.negate();
        }
        this.condition.patch({ needsParens: false });
        if (this.guard) {
            var guardNeedsParens = !this.guard.isSurroundedByParentheses();
            if (this.body && this.body.inline()) {
                // `while (a when b` → `while (a) { if (b`
                //          ^^^^^^              ^^^^^^^^
                this.overwrite(this.condition.outerEnd, this.guard.outerStart, (conditionNeedsParens ? ')' : '') + " { if " + (guardNeedsParens ? '(' : ''));
            }
            else {
                // `while (a when b` → `while (a) {\n  if (b`
                //          ^^^^^^              ^^^^^^^^^^^
                this.overwrite(this.condition.outerEnd, this.guard.outerStart, (conditionNeedsParens ? ')' : '') + " {\n" + this.getOuterLoopBodyIndent() + "if " + (guardNeedsParens ? '(' : ''));
            }
            this.guard.patch({ needsParens: false });
            // `while (a) {\n  if (b` → `while (a) {\n  if (b) {`
            //                                               ^^^
            this.insert(this.guard.outerEnd, (guardNeedsParens ? ')' : '') + " {");
        }
        else {
            // `while (a` → `while (a) {`
            //                       ^^^
            this.insert(this.condition.outerEnd, (conditionNeedsParens ? ')' : '') + " {");
        }
        var thenIndex = this.getThenTokenIndex();
        if (thenIndex) {
            var thenToken = notNull(this.sourceTokenAtIndex(thenIndex));
            var nextToken = this.sourceTokenAtIndex(notNull(thenIndex.next()));
            if (nextToken) {
                this.remove(thenToken.start, nextToken.start);
            }
            else {
                this.remove(thenToken.start, thenToken.end);
            }
        }
        this.patchPossibleNewlineAfterLoopHeader(this.guard ? this.guard.outerEnd : this.condition.outerEnd);
        this.patchBody();
        if (this.guard) {
            // Close the guard's `if` consequent block.
            if (this.body) {
                this.body.insertLineAfter('}', this.getOuterLoopBodyIndent());
            }
            else {
                this.insert(this.contentEnd, '}');
            }
        }
        // Close the `while` body block.
        if (this.body) {
            this.body.insertLineAfter('}', this.getLoopIndent());
        }
        else {
            this.insert(this.contentEnd, '}');
        }
    };
    /**
     * @private
     */
    WhilePatcher.prototype.getWhileTokenIndex = function () {
        var whileTokenIndex = this.contentStartTokenIndex;
        var whileToken = this.sourceTokenAtIndex(whileTokenIndex);
        if (!whileToken || whileToken.type !== SourceType.WHILE) {
            throw this.error("could not get first token of 'while' loop");
        }
        return whileTokenIndex;
    };
    /**
     * @private
     */
    WhilePatcher.prototype.getThenTokenIndex = function () {
        var whileTokenIndex = this.getWhileTokenIndex();
        if (!whileTokenIndex) {
            throw this.error("could not get first token of 'while' loop");
        }
        var searchStart;
        if (this.guard) {
            searchStart = this.guard.outerEnd;
        }
        else {
            searchStart = this.condition.outerEnd;
        }
        var searchEnd;
        if (this.body) {
            searchEnd = this.body.outerStart;
        }
        else {
            // Look one more token since sometimes the `then` isn't included in the range.
            var nextToken = this.nextSemanticToken();
            if (nextToken) {
                searchEnd = nextToken.end;
            }
            else {
                searchEnd = this.contentEnd;
            }
        }
        // `while a then …`
        return this.indexOfSourceTokenBetweenSourceIndicesMatching(searchStart, searchEnd, function (token) { return token.type === SourceType.THEN; });
    };
    WhilePatcher.prototype.getLoopBodyIndent = function () {
        if (this.guard) {
            return this.getOuterLoopBodyIndent() + this.getProgramIndentString();
        }
        else {
            return this.getOuterLoopBodyIndent();
        }
    };
    WhilePatcher.prototype.willPatchAsIIFE = function () {
        return this.willPatchAsExpression();
    };
    return WhilePatcher;
}(LoopPatcher));
export default WhilePatcher;
