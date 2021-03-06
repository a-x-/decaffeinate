import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import NodePatcher from './../../../patchers/NodePatcher';
import ElisionPatcher from './ElisionPatcher';
import ExpansionPatcher from './ExpansionPatcher';
var ArrayInitialiserPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ArrayInitialiserPatcher, _super);
    function ArrayInitialiserPatcher(patcherContext, members) {
        var _this = _super.call(this, patcherContext) || this;
        _this.members = members;
        return _this;
    }
    ArrayInitialiserPatcher.prototype.initialize = function () {
        this.members.forEach(function (member) { return member.setRequiresExpression(); });
    };
    ArrayInitialiserPatcher.prototype.setAssignee = function () {
        this.members.forEach(function (member) { return member.setAssignee(); });
        _super.prototype.setAssignee.call(this);
    };
    ArrayInitialiserPatcher.prototype.patchAsExpression = function () {
        var _this = this;
        this.members.forEach(function (member, i, members) {
            var isLast = i === members.length - 1;
            // An expansion in a final position is a no-op, so just remove it.
            if (isLast && member instanceof ExpansionPatcher) {
                _this.remove(members[i - 1].outerEnd, member.outerEnd);
                return;
            }
            var needsComma = !isLast && !member.hasSourceTokenAfter(SourceType.COMMA) && !(member instanceof ElisionPatcher);
            member.patch();
            if (needsComma) {
                _this.insert(member.outerEnd, ',');
            }
        });
    };
    ArrayInitialiserPatcher.prototype.isPure = function () {
        return this.members.every(function (member) { return member.isPure(); });
    };
    return ArrayInitialiserPatcher;
}(NodePatcher));
export default ArrayInitialiserPatcher;
