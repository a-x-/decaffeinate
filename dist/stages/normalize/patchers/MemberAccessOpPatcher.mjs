import * as tslib_1 from "tslib";
import PassthroughPatcher from '../../../patchers/PassthroughPatcher';
import DefaultParamPatcher from './DefaultParamPatcher';
var MemberAccessOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(MemberAccessOpPatcher, _super);
    function MemberAccessOpPatcher(patcherContext, expression, member) {
        var _this = _super.call(this, patcherContext, expression, member) || this;
        _this.expression = expression;
        _this.member = member;
        return _this;
    }
    MemberAccessOpPatcher.prototype.shouldTrimContentRange = function () {
        return true;
    };
    MemberAccessOpPatcher.prototype.patch = function () {
        _super.prototype.patch.call(this);
        var callback = this.findAddThisAssignmentCallback();
        if (callback) {
            this.overwrite(this.contentStart, this.contentEnd, callback(this.node.member.data));
        }
    };
    MemberAccessOpPatcher.prototype.findAddThisAssignmentCallback = function () {
        var patcher = this;
        while (patcher) {
            if (patcher.addThisAssignmentAtScopeHeader) {
                return patcher.addThisAssignmentAtScopeHeader;
            }
            // Don't consider this node if we're on the right side of a default param
            // (e.g. `(foo = @bar) ->`) or if we're on the left side of an object
            // destructure (e.g. the logical `a` key in `({@a}) ->`).
            if (patcher.parent instanceof DefaultParamPatcher && patcher.parent.value === patcher) {
                break;
            }
            patcher = patcher.parent;
        }
        return null;
    };
    return MemberAccessOpPatcher;
}(PassthroughPatcher));
export default MemberAccessOpPatcher;
