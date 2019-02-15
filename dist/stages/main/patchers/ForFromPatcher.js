"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ForInPatcher_1 = require("./ForInPatcher");
var ForFromPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ForFromPatcher, _super);
    function ForFromPatcher(patcherContext, keyAssignee, valAssignee, target, filter, body) {
        return _super.call(this, patcherContext, keyAssignee, valAssignee, target, null /* step */, filter, body) || this;
    }
    ForFromPatcher.prototype.shouldPatchAsForOf = function () {
        return true;
    };
    ForFromPatcher.prototype.shouldWrapForOfStatementTargetInArrayFrom = function () {
        return false;
    };
    return ForFromPatcher;
}(ForInPatcher_1.default));
exports.default = ForFromPatcher;
