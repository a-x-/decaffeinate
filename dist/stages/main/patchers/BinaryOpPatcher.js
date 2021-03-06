"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var notNull_1 = require("../../../utils/notNull");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var BinaryOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(BinaryOpPatcher, _super);
    function BinaryOpPatcher(patcherContext, left, right) {
        var _this = _super.call(this, patcherContext) || this;
        // Avoid conflicting with the `negated` flag in some subclasses that have
        // special behavior.
        _this.binaryOpNegated = false;
        _this.left = left;
        _this.right = right;
        return _this;
    }
    BinaryOpPatcher.prototype.initialize = function () {
        this.left.setRequiresExpression();
        if (!this.rhsMayBeStatement()) {
            this.right.setRequiresExpression();
        }
    };
    /**
     * Subclasses can override to avoid setting the RHS as an expression by default.
     */
    BinaryOpPatcher.prototype.rhsMayBeStatement = function () {
        return false;
    };
    BinaryOpPatcher.prototype.negate = function () {
        this.binaryOpNegated = !this.binaryOpNegated;
    };
    BinaryOpPatcher.prototype.isPure = function () {
        return this.left.isPure() && this.right.isPure();
    };
    /**
     * LEFT OP RIGHT
     */
    BinaryOpPatcher.prototype.patchAsExpression = function (_a) {
        var _b = (_a === void 0 ? {} : _a).needsParens, needsParens = _b === void 0 ? false : _b;
        var addParens = (needsParens && !this.isSurroundedByParentheses()) || this.binaryOpNegated;
        if (this.binaryOpNegated) {
            this.insert(this.innerStart, '!');
        }
        if (addParens) {
            this.insert(this.innerStart, '(');
        }
        if (this.left instanceof BinaryOpPatcher) {
            this.left.patch({ needsParens: this.getOperator() !== this.left.getOperator() });
        }
        else {
            this.left.patch({ needsParens: true });
        }
        this.patchOperator();
        if (this.right instanceof BinaryOpPatcher) {
            this.right.patch({ needsParens: this.getOperator() !== this.right.getOperator() });
        }
        else {
            this.right.patch({ needsParens: true });
        }
        if (addParens) {
            this.insert(this.innerEnd, ')');
        }
    };
    BinaryOpPatcher.prototype.patchOperator = function () {
        // override point for subclasses
    };
    BinaryOpPatcher.prototype.getOperator = function () {
        return this.sourceOfToken(this.getOperatorToken());
    };
    BinaryOpPatcher.prototype.getOperatorToken = function () {
        var operatorTokenIndex = this.indexOfSourceTokenBetweenPatchersMatching(this.left, this.right, this.operatorTokenPredicate());
        if (!operatorTokenIndex) {
            throw this.error('expected operator between binary operands');
        }
        return notNull_1.default(this.sourceTokenAtIndex(operatorTokenIndex));
    };
    /**
     * Subclasses may override this to provide a custom token predicate.
     */
    BinaryOpPatcher.prototype.operatorTokenPredicate = function () {
        return function (token) { return token.type === coffee_lex_1.SourceType.OPERATOR || token.type === coffee_lex_1.SourceType.EXISTENCE; };
    };
    /**
     * IF `LEFT` needs parens then `LEFT + RIGHT` needs parens.
     */
    BinaryOpPatcher.prototype.statementNeedsParens = function () {
        return this.left.statementShouldAddParens();
    };
    return BinaryOpPatcher;
}(NodePatcher_1.default));
exports.default = BinaryOpPatcher;
