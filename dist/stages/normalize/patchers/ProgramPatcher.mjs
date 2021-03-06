import * as tslib_1 from "tslib";
import SharedProgramPatcher from '../../../patchers/SharedProgramPatcher';
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
}(SharedProgramPatcher));
export default ProgramPatcher;
