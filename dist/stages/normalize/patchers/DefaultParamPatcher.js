"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PassthroughPatcher_1 = require("../../../patchers/PassthroughPatcher");
var AssignOpPatcher_1 = require("./AssignOpPatcher");
var DoOpPatcher_1 = require("./DoOpPatcher");
var FunctionPatcher_1 = require("./FunctionPatcher");
var DefaultParamPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(DefaultParamPatcher, _super);
    function DefaultParamPatcher(patcherContext, param, value) {
        var _this = _super.call(this, patcherContext, param, value) || this;
        _this.param = param;
        _this.value = value;
        return _this;
    }
    DefaultParamPatcher.prototype.patch = function () {
        // Note that when there is both a `this` assignment and a default param
        // assignment (e.g. `(@a=b()) -> c`), assignment callbacks are run
        // bottom-up, so by the time this code runs, any necessary parameter
        // renaming will have already happened. This means that `paramCode` will
        // naturally have the renamed parameter, so we don't need to do anything
        // special.
        _super.prototype.patch.call(this);
        if (this.shouldExtractToConditionalAssign()) {
            var callback = this.findAddDefaultParamAssignmentCallback();
            if (callback) {
                var paramCode = this.slice(this.param.contentStart, this.param.contentEnd);
                var valueCode = this.slice(this.value.contentStart, this.value.contentEnd);
                var newParamCode = callback(paramCode, valueCode, this.param.node);
                this.overwrite(this.param.contentStart, this.param.contentEnd, newParamCode);
                this.remove(this.param.outerEnd, this.value.outerEnd);
            }
        }
    };
    DefaultParamPatcher.prototype.findAddDefaultParamAssignmentCallback = function () {
        var patcher = this;
        while (patcher) {
            if (patcher.addDefaultParamAssignmentAtScopeHeader) {
                return patcher.addDefaultParamAssignmentAtScopeHeader;
            }
            // Don't consider this node if we're on the right side of another default
            // param (e.g. `(foo = (bar=3) ->) ->`).
            if (patcher.parent instanceof DefaultParamPatcher && patcher.parent.value === patcher) {
                break;
            }
            patcher = patcher.parent;
        }
        return null;
    };
    /**
     * For correctness reasons, we usually need to extract the assignment into a
     * statement that checks null and undefined rather than just undefined. But
     * skip that step if the user opted out of it in favor of cleaner code, and
     * also in a case like `do (a=1) -> a`, which is handled later as a special
     * case and doesn't use JS default params.
     *
     * Also skip the conversion when the default is to `null`, since the behavior
     * between CoffeeScript and JavaScript happens to be the same in that case.
     */
    DefaultParamPatcher.prototype.shouldExtractToConditionalAssign = function () {
        if (this.options.looseDefaultParams) {
            return false;
        }
        if (this.value.node.type === 'Null') {
            return false;
        }
        if (this.parent instanceof FunctionPatcher_1.default && this.parent.parent instanceof DoOpPatcher_1.default) {
            return false;
        }
        if (this.parent instanceof FunctionPatcher_1.default &&
            this.parent.parent instanceof AssignOpPatcher_1.default &&
            this.parent.parent.parent instanceof DoOpPatcher_1.default) {
            return false;
        }
        return true;
    };
    return DefaultParamPatcher;
}(PassthroughPatcher_1.default));
exports.default = DefaultParamPatcher;
