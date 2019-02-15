import * as tslib_1 from "tslib";
import SourceType from 'coffee-lex/dist/SourceType';
import normalizeListItem from '../../../utils/normalizeListItem';
import NodePatcher from './../../../patchers/NodePatcher';
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
    ObjectInitialiserPatcher.prototype.patchAsExpression = function () {
        var e_1, _a;
        try {
            for (var _b = tslib_1.__values(this.members.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 2), i = _d[0], member = _d[1];
                member.patch();
                normalizeListItem(this, member, this.members[i + 1]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    ObjectInitialiserPatcher.prototype.isImplicitObjectInitializer = function () {
        return this.firstToken().type !== SourceType.LBRACE;
    };
    return ObjectInitialiserPatcher;
}(NodePatcher));
export default ObjectInitialiserPatcher;
