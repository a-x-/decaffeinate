import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import NodePatcher from '../../../patchers/NodePatcher';
import notNull from '../../../utils/notNull';
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
        var next = this.sourceTokenAtIndex(notNull(this.contentStartTokenIndex.next()));
        if (!next) {
            throw this.error('Expected to find a next token.');
        }
        if (loop.type !== SourceType.LOOP) {
            throw this.error("expected first token of loop to be LOOP, but got: " + SourceType[loop.type]);
        }
        if (next.type === SourceType.THEN || !this.body.node.inline) {
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
}(NodePatcher));
export default LoopPatcher;
