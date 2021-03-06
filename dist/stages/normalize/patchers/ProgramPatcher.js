"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SharedProgramPatcher_1 = require("../../../patchers/SharedProgramPatcher");
var ProgramPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ProgramPatcher, _super);
    function ProgramPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProgramPatcher.prototype.patchAsStatement = function () {
        if (this.body) {
            this.body.patch();
        }
        this.patchHelpers();
    };
    return ProgramPatcher;
}(SharedProgramPatcher_1.default));
exports.default = ProgramPatcher;
