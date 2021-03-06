import * as tslib_1 from "tslib";
import NodePatcher from '../../../patchers/NodePatcher';
import countVariableUsages from '../../../utils/countVariableUsages';
import IdentifierPatcher from './IdentifierPatcher';
var TryPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(TryPatcher, _super);
    function TryPatcher(patcherContext, body, catchAssignee, catchBody, finallyBody) {
        var _this = _super.call(this, patcherContext) || this;
        _this.body = body;
        _this.catchAssignee = catchAssignee;
        _this.catchBody = catchBody;
        _this.finallyBody = finallyBody;
        return _this;
    }
    TryPatcher.prototype.patchAsExpression = function () {
        if (this.body) {
            this.body.patch();
        }
        var bodyPrefixLine = this.patchCatchAssignee();
        if (bodyPrefixLine !== null && this.catchAssignee) {
            if (this.catchBody) {
                this.catchBody.insertLineBefore(bodyPrefixLine);
            }
            else {
                this.insert(this.catchAssignee.outerEnd, " then " + bodyPrefixLine);
            }
        }
        if (this.catchBody) {
            this.catchBody.patch();
        }
        if (this.finallyBody) {
            this.finallyBody.patch();
        }
    };
    TryPatcher.prototype.patchCatchAssignee = function () {
        if (!this.catchAssignee) {
            return null;
        }
        if (this.needsExpressionExtracted()) {
            var assigneeName = this.claimFreeBinding('error');
            var assigneeCode = this.catchAssignee.patchAndGetCode();
            this.overwrite(this.catchAssignee.contentStart, this.catchAssignee.contentEnd, assigneeName);
            return assigneeCode + " = " + assigneeName;
        }
        else {
            this.catchAssignee.patch();
            return null;
        }
    };
    /**
     * Catch assignees in CoffeeScript can have (mostly) arbitrary assignees,
     * while JS is more limited. Generally JS only supports assignees that can
     * create variables.
     *
     * Also, JavaScript exception assignees are scoped to the catch block while
     * CoffeeScript exception assignees follow function scoping, so pull the
     * variable out into an assignment if the variable is used externally.
     */
    TryPatcher.prototype.needsExpressionExtracted = function () {
        if (!this.catchAssignee) {
            return false;
        }
        if (!(this.catchAssignee instanceof IdentifierPatcher)) {
            return true;
        }
        var varName = this.catchAssignee.node.data;
        var exceptionVarUsages = this.catchBody ? countVariableUsages(this.catchBody.node, varName) + 1 : 1;
        var totalVarUsages = countVariableUsages(this.getScope().containerNode, varName);
        return totalVarUsages > exceptionVarUsages;
    };
    return TryPatcher;
}(NodePatcher));
export default TryPatcher;
