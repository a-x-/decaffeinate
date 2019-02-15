"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var notNull_1 = require("../../../utils/notNull");
var ReturnPatcher_1 = require("./ReturnPatcher");
var AwaitReturnPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(AwaitReturnPatcher, _super);
    function AwaitReturnPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AwaitReturnPatcher.prototype.initialize = function () {
        this.awaits();
        _super.prototype.initialize.call(this);
    };
    AwaitReturnPatcher.prototype.patchAsStatement = function () {
        var awaitTokenIndex = this.contentStartTokenIndex;
        var returnTokenIndex = notNull_1.default(awaitTokenIndex.next());
        var awaitToken = notNull_1.default(this.sourceTokenAtIndex(awaitTokenIndex));
        var returnToken = notNull_1.default(this.sourceTokenAtIndex(returnTokenIndex));
        if (awaitToken.type !== coffee_lex_1.SourceType.IDENTIFIER || returnToken.type !== coffee_lex_1.SourceType.RETURN) {
            throw this.error('Unexpected token types for `await return`.');
        }
        this.remove(awaitToken.start, returnToken.start);
        _super.prototype.patchAsStatement.call(this);
    };
    return AwaitReturnPatcher;
}(ReturnPatcher_1.default));
exports.default = AwaitReturnPatcher;
