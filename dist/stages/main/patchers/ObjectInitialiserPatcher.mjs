import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import notNull from '../../../utils/notNull';
import { isSemanticToken } from '../../../utils/types';
import NodePatcher from './../../../patchers/NodePatcher';
import ObjectInitialiserMemberPatcher from './ObjectInitialiserMemberPatcher';
/**
 * Handles object literals.
 */
var ObjectInitialiserPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ObjectInitialiserPatcher, _super);
    function ObjectInitialiserPatcher(patcherContext, members) {
        var _this = _super.call(this, patcherContext) || this;
        _this.members = members;
        return _this;
    }
    ObjectInitialiserPatcher.prototype.initialize = function () {
        this.members.forEach(function (member) { return member.setRequiresExpression(); });
    };
    ObjectInitialiserPatcher.prototype.setAssignee = function () {
        this.members.forEach(function (member) { return member.setAssignee(); });
        _super.prototype.setAssignee.call(this);
    };
    ObjectInitialiserPatcher.prototype.setExpression = function (force) {
        if (this.isImplicitObject()) {
            var curlyBraceInsertionPosition = this.getOpenCurlyInfo().curlyBraceInsertionPosition;
            this.adjustBoundsToInclude(curlyBraceInsertionPosition);
        }
        return _super.prototype.setExpression.call(this, force);
    };
    /**
     * Objects as expressions are very similar to their CoffeeScript equivalents.
     */
    ObjectInitialiserPatcher.prototype.patchAsExpression = function () {
        var implicitObject = this.isImplicitObject();
        if (implicitObject) {
            var _a = this.getOpenCurlyInfo(), curlyBraceInsertionPosition = _a.curlyBraceInsertionPosition, textToInsert = _a.textToInsert, shouldIndent = _a.shouldIndent;
            this.insert(curlyBraceInsertionPosition, textToInsert);
            if (shouldIndent) {
                this.indent();
            }
        }
        this.patchMembers();
        if (implicitObject) {
            if (this.shouldExpandCurlyBraces() && !this.isSurroundedByParentheses()) {
                this.appendLineAfter('}', -1);
            }
            else {
                this.insert(this.innerEnd, '}');
            }
        }
    };
    ObjectInitialiserPatcher.prototype.getOpenCurlyInfo = function () {
        var curlyBraceInsertionPosition = this.innerStart;
        var textToInsert = '{';
        var shouldIndent = false;
        if (this.shouldExpandCurlyBraces()) {
            if (this.implicitlyReturns() && !this.isSurroundedByParentheses()) {
                textToInsert = "{\n" + this.getIndent();
                shouldIndent = true;
            }
            else {
                var tokenIndexBeforeOuterStartTokenIndex = this.outerStartTokenIndex;
                if (!this.isSurroundedByParentheses()) {
                    tokenIndexBeforeOuterStartTokenIndex = tokenIndexBeforeOuterStartTokenIndex.previous();
                }
                if (tokenIndexBeforeOuterStartTokenIndex) {
                    var precedingTokenIndex = this.context.sourceTokens.lastIndexOfTokenMatchingPredicate(isSemanticToken, tokenIndexBeforeOuterStartTokenIndex);
                    if (precedingTokenIndex) {
                        var precedingToken = notNull(this.sourceTokenAtIndex(precedingTokenIndex));
                        curlyBraceInsertionPosition = precedingToken.end;
                        var precedingTokenText = this.sourceOfToken(precedingToken);
                        var lastCharOfToken = precedingTokenText[precedingTokenText.length - 1];
                        var needsSpace = lastCharOfToken === ':' || lastCharOfToken === '=' || lastCharOfToken === ',';
                        if (needsSpace) {
                            textToInsert = ' {';
                        }
                    }
                }
            }
        }
        return { curlyBraceInsertionPosition: curlyBraceInsertionPosition, textToInsert: textToInsert, shouldIndent: shouldIndent };
    };
    /**
     * Objects as statements need to be wrapped in parentheses, or else they'll be
     * confused with blocks. That is, this is not an object [1]:
     *
     *   { a: 0 };
     *
     * But this is fine:
     *
     *   ({ a: 0 });
     *
     * [1]: It is actually valid code, though. It's a block with a labeled
     * statement `a` with a single expression statement, being the literal 0.
     */
    ObjectInitialiserPatcher.prototype.patchAsStatement = function () {
        var needsParentheses = !this.isSurroundedByParentheses();
        var implicitObject = this.isImplicitObject();
        if (needsParentheses) {
            this.insert(this.contentStart, '(');
        }
        if (implicitObject) {
            if (this.shouldExpandCurlyBraces() && !this.isSurroundedByParentheses()) {
                this.insert(this.innerStart, "{\n" + this.getIndent());
                this.indent();
            }
            else {
                this.insert(this.innerStart, '{');
            }
        }
        this.patchMembers();
        if (implicitObject) {
            if (this.shouldExpandCurlyBraces() && !this.isSurroundedByParentheses()) {
                this.appendLineAfter('}', -1);
            }
            else {
                this.insert(this.innerEnd, '}');
            }
        }
        if (needsParentheses) {
            this.insert(this.contentEnd, ')');
        }
    };
    /**
     * @private
     */
    ObjectInitialiserPatcher.prototype.shouldExpandCurlyBraces = function () {
        return (this.isMultiline() ||
            (this.parent instanceof ObjectInitialiserMemberPatcher && notNull(this.parent.parent).isMultiline()));
    };
    /**
     * @private
     */
    ObjectInitialiserPatcher.prototype.patchMembers = function () {
        var _this = this;
        this.members.forEach(function (member, i, members) {
            member.patch();
            if (i !== members.length - 1) {
                if (!member.hasSourceTokenAfter(SourceType.COMMA)) {
                    _this.insert(member.outerEnd, ',');
                }
            }
        });
    };
    /**
     * Determines whether this object is implicit, i.e. it lacks braces.
     *
     *   a: b      # true
     *   { a: b }  # false
     */
    ObjectInitialiserPatcher.prototype.isImplicitObject = function () {
        var tokens = this.context.sourceTokens;
        var indexOfFirstToken = notNull(tokens.indexOfTokenStartingAtSourceIndex(this.contentStart));
        return notNull(tokens.tokenAtIndex(indexOfFirstToken)).type !== SourceType.LBRACE;
    };
    /**
     * Starting a statement with an object always requires parens.
     */
    ObjectInitialiserPatcher.prototype.statementNeedsParens = function () {
        return true;
    };
    return ObjectInitialiserPatcher;
}(NodePatcher));
export default ObjectInitialiserPatcher;
