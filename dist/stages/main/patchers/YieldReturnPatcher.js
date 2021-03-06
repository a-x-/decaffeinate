"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var notNull_1 = require("../../../utils/notNull");
var ReturnPatcher_1 = require("./ReturnPatcher");
var YieldReturnPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(YieldReturnPatcher, _super);
    function YieldReturnPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    YieldReturnPatcher.prototype.initialize = function () {
        this.yields();
        _super.prototype.initialize.call(this);
    };
    YieldReturnPatcher.prototype.patchAsStatement = function () {
        var yieldTokenIndex = this.contentStartTokenIndex;
        var returnTokenIndex = notNull_1.default(yieldTokenIndex.next());
        var yieldToken = notNull_1.default(this.sourceTokenAtIndex(yieldTokenIndex));
        var returnToken = notNull_1.default(this.sourceTokenAtIndex(returnTokenIndex));
        if (yieldToken.type !== coffee_lex_1.SourceType.YIELD || returnToken.type !== coffee_lex_1.SourceType.RETURN) {
            throw this.error('Unexpected token types for `yield return`.');
        }
        this.remove(yieldToken.start, returnToken.start);
        _super.prototype.patchAsStatement.call(this);
    };
    return YieldReturnPatcher;
}(ReturnPatcher_1.default));
exports.default = YieldReturnPatcher;
