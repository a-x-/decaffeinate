"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var normalizeListItem_1 = require("../../../utils/normalizeListItem");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var ArrayInitialiserPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ArrayInitialiserPatcher, _super);
    function ArrayInitialiserPatcher(patcherContext, members) {
        var _this = _super.call(this, patcherContext) || this;
        _this.members = members;
        return _this;
    }
    ArrayInitialiserPatcher.prototype.patchAsExpression = function () {
        var e_1, _a;
        try {
            for (var _b = tslib_1.__values(this.members.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 2), i = _d[0], member = _d[1];
                member.patch();
                normalizeListItem_1.default(this, member, this.members[i + 1]);
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
    return ArrayInitialiserPatcher;
}(NodePatcher_1.default));
exports.default = ArrayInitialiserPatcher;
