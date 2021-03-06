"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var notNull_1 = require("../../../utils/notNull");
/**
 * Normalizes `loop` loops by rewriting into standard `while`, e.g.
 *
 *   loop
 *     b()
 *
 * becomes
 *
 *   while true
 *     b()
 */
var LoopPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(LoopPatcher, _super);
    function LoopPatcher(patcherContext, body) {
        var _this = _super.call(this, patcherContext) || this;
        _this.body = body;
        return _this;
    }
    LoopPatcher.prototype.patchAsExpression = function () {
        var loop = this.firstToken();
        var next = this.sourceTokenAtIndex(notNull_1.default(this.contentStartTokenIndex.next()));
        if (!next) {
            throw this.error('Expected to find a next token.');
        }
        if (loop.type !== coffee_lex_1.SourceType.LOOP) {
            throw this.error("expected first token of loop to be LOOP, but got: " + coffee_lex_1.SourceType[loop.type]);
        }
        if (next.type === coffee_lex_1.SourceType.THEN || !this.body.node.inline) {
            this.overwrite(loop.start, loop.end, 'while true');
        }
        else {
            this.overwrite(loop.start, loop.end, 'while true then');
        }
        if (this.body) {
            this.body.patch();
        }
    };
    return LoopPatcher;
}(NodePatcher_1.default));
exports.default = LoopPatcher;
