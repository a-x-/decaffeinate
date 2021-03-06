"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var notNull_1 = require("../../../utils/notNull");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
/**
 * Handles sequence expressions/statements, e.g `a; b`.
 */
var SeqOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SeqOpPatcher, _super);
    function SeqOpPatcher(patcherContext, left, right) {
        var _this = _super.call(this, patcherContext) || this;
        _this.negated = false;
        _this.left = left;
        _this.right = right;
        return _this;
    }
    SeqOpPatcher.prototype.negate = function () {
        this.negated = !this.negated;
    };
    /**
     * LEFT ';' RIGHT
     */
    SeqOpPatcher.prototype.patchAsExpression = function () {
        this.left.setRequiresExpression();
        this.right.setRequiresExpression();
        if (this.negated) {
            this.insert(this.innerStart, '!(');
        }
        this.left.patch();
        var token = this.getOperatorToken();
        if (token.type === coffee_lex_1.SourceType.SEMICOLON) {
            // `a; b` → `a, b`
            //   ^        ^
            this.overwrite(token.start, token.end, ',');
        }
        else if (token.type === coffee_lex_1.SourceType.NEWLINE) {
            this.insert(this.left.outerEnd, ',');
        }
        this.right.patch();
        if (this.negated) {
            this.insert(this.innerEnd, ')');
        }
    };
    /**
     * If we're patching as a statement, we can just keep the semicolon or newline.
     */
    SeqOpPatcher.prototype.patchAsStatement = function () {
        this.left.patch();
        this.right.patch();
    };
    SeqOpPatcher.prototype.getOperatorToken = function () {
        var operatorTokenIndex = this.indexOfSourceTokenBetweenPatchersMatching(this.left, this.right, function (token) { return token.type === coffee_lex_1.SourceType.SEMICOLON || token.type === coffee_lex_1.SourceType.NEWLINE; });
        if (!operatorTokenIndex) {
            throw this.error('expected operator between binary operands');
        }
        return notNull_1.default(this.sourceTokenAtIndex(operatorTokenIndex));
    };
    SeqOpPatcher.prototype.statementNeedsParens = function () {
        return this.left.statementShouldAddParens();
    };
    return SeqOpPatcher;
}(NodePatcher_1.default));
exports.default = SeqOpPatcher;
