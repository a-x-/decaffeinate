import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import PassthroughPatcher from '../../../patchers/PassthroughPatcher';
import MemberAccessOpPatcher from './MemberAccessOpPatcher';
var ThisPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ThisPatcher, _super);
    function ThisPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * When patching a shorthand like `@a` as repeatable, we need to add a dot to
     * make the result still syntactically valid.
     */
    ThisPatcher.prototype.patchAsRepeatableExpression = function (repeatableOptions, patchOptions) {
        if (repeatableOptions === void 0) { repeatableOptions = {}; }
        if (patchOptions === void 0) { patchOptions = {}; }
        var ref = _super.prototype.patchAsRepeatableExpression.call(this, repeatableOptions, patchOptions);
        var addedParens = (!this.isRepeatable() || repeatableOptions.forceRepeat) && repeatableOptions.parens;
        if (addedParens && this.parent instanceof MemberAccessOpPatcher) {
            var nextToken = this.nextSemanticToken();
            if (!nextToken || nextToken.type !== SourceType.DOT) {
                this.insert(this.innerEnd, '.');
            }
        }
        return ref;
    };
    return ThisPatcher;
}(PassthroughPatcher));
export default ThisPatcher;
