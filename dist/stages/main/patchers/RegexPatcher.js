"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var downgradeUnicodeCodePointEscapesInRange_1 = require("../../../utils/downgradeUnicodeCodePointEscapesInRange");
var escapeSpecialWhitespaceInRange_1 = require("../../../utils/escapeSpecialWhitespaceInRange");
var RegexPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(RegexPatcher, _super);
    function RegexPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RegexPatcher.prototype.patchAsExpression = function () {
        escapeSpecialWhitespaceInRange_1.default(this.contentStart + 1, this.contentEnd - 1, this);
        if (!this.node.flags.unicode) {
            downgradeUnicodeCodePointEscapesInRange_1.default(this.contentStart + 1, this.contentEnd - 1, this);
        }
    };
    return RegexPatcher;
}(NodePatcher_1.default));
exports.default = RegexPatcher;
