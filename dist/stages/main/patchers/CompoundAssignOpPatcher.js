"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var nodeContainsSoakOperation_1 = require("../../../utils/nodeContainsSoakOperation");
var notNull_1 = require("../../../utils/notNull");
var AssignOpPatcher_1 = require("./AssignOpPatcher");
var CompoundAssignOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(CompoundAssignOpPatcher, _super);
    function CompoundAssignOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CompoundAssignOpPatcher.prototype.getOperatorToken = function () {
        var operatorIndex = this.indexOfSourceTokenBetweenPatchersMatching(this.assignee, this.expression, function (token) { return token.type === coffee_lex_1.SourceType.OPERATOR; });
        if (!operatorIndex) {
            throw this.error("expected OPERATOR token between assignee and expression", this.assignee.outerEnd, this.expression.outerStart);
        }
        return notNull_1.default(this.sourceTokenAtIndex(operatorIndex));
    };
    /**
     * If `LHS` needs parens then `LHS += RHS` needs parens.
     */
    CompoundAssignOpPatcher.prototype.statementNeedsParens = function () {
        return this.assignee.statementShouldAddParens();
    };
    /**
     * If the left-hand side of the assignment has a soak operation, then there
     * may be a __guard__ call surrounding the whole thing, so we can't patch
     * statement code, so instead run the expression code path.
     */
    CompoundAssignOpPatcher.prototype.lhsHasSoakOperation = function () {
        return nodeContainsSoakOperation_1.default(this.assignee.node);
    };
    return CompoundAssignOpPatcher;
}(AssignOpPatcher_1.default));
exports.default = CompoundAssignOpPatcher;
