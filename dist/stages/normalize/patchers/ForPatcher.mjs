import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import NodePatcher from '../../../patchers/NodePatcher';
import canPatchAssigneeToJavaScript from '../../../utils/canPatchAssigneeToJavaScript';
import notNull from '../../../utils/notNull';
import postfixExpressionRequiresParens from '../../../utils/postfixExpressionRequiresParens';
import postfixNodeNeedsOuterParens from '../../../utils/postfixNodeNeedsOuterParens';
var ForPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ForPatcher, _super);
    function ForPatcher(patcherContext, keyAssignee, valAssignee, target, filter, body) {
        var _this = _super.call(this, patcherContext) || this;
        _this.keyAssignee = keyAssignee;
        _this.valAssignee = valAssignee;
        _this.target = target;
        _this.filter = filter;
        _this.body = body;
        return _this;
    }
    ForPatcher.prototype.patchAsExpression = function () {
        var bodyPrefixLine = null;
        if (this.keyAssignee) {
            // The key assignee can't be a complex expression, so we don't need to
            // worry about checking canPatchAssigneeToJavaScript.
            this.keyAssignee.patch();
        }
        if (this.valAssignee) {
            bodyPrefixLine = this.patchValAssignee();
        }
        this.target.patch();
        if (this.filter) {
            this.filter.patch();
        }
        if (this.isPostFor()) {
            this.surroundThenUsagesInParens();
            var forToken = this.getForToken();
            var forThroughEnd = this.slice(forToken.start, this.contentEnd);
            var needsParens = postfixNodeNeedsOuterParens(this);
            this.remove(this.body.outerEnd, this.contentEnd);
            if (needsParens) {
                this.insert(this.body.outerStart, '(');
            }
            this.insert(this.body.outerStart, forThroughEnd + " then ");
            if (needsParens) {
                this.insert(this.contentEnd, ')');
            }
        }
        if (bodyPrefixLine !== null) {
            if (this.body) {
                this.body.insertLineBefore(bodyPrefixLine);
            }
            else {
                this.insert(this.contentEnd, " " + bodyPrefixLine);
            }
        }
        if (this.body) {
            this.body.patch();
        }
    };
    ForPatcher.prototype.patchAsStatement = function () {
        this.patchAsExpression();
    };
    /**
     * Patch the value assignee, and if we need to add a line to the start of the
     * body, return that line. Otherwise, return null.
     */
    ForPatcher.prototype.patchValAssignee = function () {
        if (!this.valAssignee) {
            throw this.error('Expected to find a valAssignee.');
        }
        if (canPatchAssigneeToJavaScript(this.valAssignee.node, this.options)) {
            this.valAssignee.patch();
            return null;
        }
        else {
            var assigneeName = this.claimFreeBinding('value');
            var assigneeCode = this.valAssignee.patchAndGetCode();
            this.overwrite(this.valAssignee.contentStart, this.valAssignee.contentEnd, assigneeName);
            return assigneeCode + " = " + assigneeName;
        }
    };
    /**
     * @private
     */
    ForPatcher.prototype.isPostFor = function () {
        return this.body && this.body.contentStart < this.target.contentStart;
    };
    /**
     * Defensively wrap expressions in parens if they might contain a `then`
     * token, since that would mess up the parsing when we rearrange the for loop.
     *
     * This method can be subclassed to account for additional fields.
     */
    ForPatcher.prototype.surroundThenUsagesInParens = function () {
        if (postfixExpressionRequiresParens(this.slice(this.target.contentStart, this.target.contentEnd))) {
            this.target.surroundInParens();
        }
        if (this.filter && postfixExpressionRequiresParens(this.slice(this.filter.contentStart, this.filter.contentEnd))) {
            this.filter.surroundInParens();
        }
    };
    /**
     * @private
     */
    ForPatcher.prototype.getForToken = function () {
        if (this.isPostFor()) {
            var afterForToken = this.getFirstHeaderPatcher();
            var index = this.indexOfSourceTokenBetweenPatchersMatching(this.body, afterForToken, function (token) { return token.type === SourceType.FOR; });
            if (!index) {
                throw this.error("cannot find 'for' token in loop");
            }
            return notNull(this.sourceTokenAtIndex(index));
        }
        else {
            var token = this.sourceTokenAtIndex(this.contentStartTokenIndex);
            if (!token || token.type !== SourceType.FOR) {
                throw this.error("expected 'for' at start of loop");
            }
            return token;
        }
    };
    /**
     * @private
     */
    ForPatcher.prototype.getFirstHeaderPatcher = function () {
        var candidates = [this.keyAssignee, this.valAssignee, this.target];
        var result = null;
        candidates.forEach(function (candidate) {
            if (!candidate) {
                return;
            }
            if (result === null || candidate.contentStart < result.contentStart) {
                result = candidate;
            }
        });
        if (result === null) {
            throw this.error("cannot get first patcher of 'for' loop header");
        }
        return result;
    };
    return ForPatcher;
}(NodePatcher));
export default ForPatcher;
