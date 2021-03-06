"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var canPatchAssigneeToJavaScript_1 = require("../../../utils/canPatchAssigneeToJavaScript");
var notNull_1 = require("../../../utils/notNull");
var postfixExpressionRequiresParens_1 = require("../../../utils/postfixExpressionRequiresParens");
var postfixNodeNeedsOuterParens_1 = require("../../../utils/postfixNodeNeedsOuterParens");
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
            var needsParens = postfixNodeNeedsOuterParens_1.default(this);
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
        if (canPatchAssigneeToJavaScript_1.default(this.valAssignee.node, this.options)) {
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
        if (postfixExpressionRequiresParens_1.default(this.slice(this.target.contentStart, this.target.contentEnd))) {
            this.target.surroundInParens();
        }
        if (this.filter && postfixExpressionRequiresParens_1.default(this.slice(this.filter.contentStart, this.filter.contentEnd))) {
            this.filter.surroundInParens();
        }
    };
    /**
     * @private
     */
    ForPatcher.prototype.getForToken = function () {
        if (this.isPostFor()) {
            var afterForToken = this.getFirstHeaderPatcher();
            var index = this.indexOfSourceTokenBetweenPatchersMatching(this.body, afterForToken, function (token) { return token.type === coffee_lex_1.SourceType.FOR; });
            if (!index) {
                throw this.error("cannot find 'for' token in loop");
            }
            return notNull_1.default(this.sourceTokenAtIndex(index));
        }
        else {
            var token = this.sourceTokenAtIndex(this.contentStartTokenIndex);
            if (!token || token.type !== coffee_lex_1.SourceType.FOR) {
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
}(NodePatcher_1.default));
exports.default = ForPatcher;
