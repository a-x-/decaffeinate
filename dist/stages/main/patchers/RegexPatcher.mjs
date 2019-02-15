import * as tslib_1 from "tslib";
import NodePatcher from '../../../patchers/NodePatcher';
import downgradeUnicodeCodePointEscapesInRange from '../../../utils/downgradeUnicodeCodePointEscapesInRange';
import escapeSpecialWhitespaceInRange from '../../../utils/escapeSpecialWhitespaceInRange';
var RegexPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(RegexPatcher, _super);
    function RegexPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RegexPatcher.prototype.patchAsExpression = function () {
        escapeSpecialWhitespaceInRange(this.contentStart + 1, this.contentEnd - 1, this);
        if (!this.node.flags.unicode) {
            downgradeUnicodeCodePointEscapesInRange(this.contentStart + 1, this.contentEnd - 1, this);
        }
    };
    return RegexPatcher;
}(NodePatcher));
export default RegexPatcher;
