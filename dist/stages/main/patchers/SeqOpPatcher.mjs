import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import notNull from '../../../utils/notNull';
import NodePatcher from './../../../patchers/NodePatcher';
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
        if (token.type === SourceType.SEMICOLON) {
            // `a; b` → `a, b`
            //   ^        ^
            this.overwrite(token.start, token.end, ',');
        }
        else if (token.type === SourceType.NEWLINE) {
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
        var operatorTokenIndex = this.indexOfSourceTokenBetweenPatchersMatching(this.left, this.right, function (token) { return token.type === SourceType.SEMICOLON || token.type === SourceType.NEWLINE; });
        if (!operatorTokenIndex) {
            throw this.error('expected operator between binary operands');
        }
        return notNull(this.sourceTokenAtIndex(operatorTokenIndex));
    };
    SeqOpPatcher.prototype.statementNeedsParens = function () {
        return this.left.statementShouldAddParens();
    };
    return SeqOpPatcher;
}(NodePatcher));
export default SeqOpPatcher;
