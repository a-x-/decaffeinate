import * as tslib_1 from "tslib";
import SourceType from 'coffee-lex/dist/SourceType';
import { Identifier } from 'decaffeinate-parser/dist/nodes';
import MemberAccessOpPatcher from './MemberAccessOpPatcher';
import ObjectBodyMemberPatcher from './ObjectBodyMemberPatcher';
import StringPatcher from './StringPatcher';
import ThisPatcher from './ThisPatcher';
/**
 * Handles object properties.
 */
var ObjectInitialiserMemberPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ObjectInitialiserMemberPatcher, _super);
    function ObjectInitialiserMemberPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ObjectInitialiserMemberPatcher.prototype.setAssignee = function () {
        if (this.expression === null) {
            this.key.setAssignee();
        }
        else {
            this.expression.setAssignee();
        }
        _super.prototype.setAssignee.call(this);
    };
    ObjectInitialiserMemberPatcher.prototype.patchAsProperty = function () {
        if (this.expression === null) {
            var shouldExpand = !(this.key.node instanceof Identifier) || this.node.isComputed;
            this.patchAsShorthand({
                expand: shouldExpand
            });
        }
        else {
            _super.prototype.patchAsProperty.call(this);
        }
    };
    /**
     * @private
     */
    ObjectInitialiserMemberPatcher.prototype.patchAsShorthand = function (_a) {
        var _b = _a.expand, expand = _b === void 0 ? false : _b;
        var key = this.key;
        if (key instanceof MemberAccessOpPatcher) {
            key.patch();
            // e.g. `{ @name }`
            if (!(key.expression instanceof ThisPatcher)) {
                throw this.error("expected property key member access on 'this', e.g. '@name'");
            }
            // `{ @name }` → `{ name: @name }`
            //                  ^^^^^^
            this.insert(key.outerStart, key.getMemberName() + ": ");
        }
        else if (expand) {
            var needsBrackets = key instanceof StringPatcher && key.shouldBecomeTemplateLiteral();
            if (needsBrackets) {
                // `{ `a = ${1 + 1}` }` → `{ [`a = ${1 + 1}` }`
                //                           ^
                this.insert(key.outerStart, '[');
            }
            var valueCode = key.patchRepeatable();
            if (needsBrackets) {
                this.insert(key.outerEnd, ']');
            }
            var keyEnd = void 0;
            if (this.node.isComputed) {
                var closeBracketToken = key.outerEndTokenIndex.next();
                var tokenAfterLast = closeBracketToken ? this.sourceTokenAtIndex(closeBracketToken) : null;
                if (!tokenAfterLast || tokenAfterLast.type !== SourceType.RBRACKET) {
                    throw this.error('Expected close-bracket after computed property.');
                }
                keyEnd = tokenAfterLast.end;
            }
            else {
                keyEnd = key.outerEnd;
            }
            // `{ a } → { a: a }`
            //             ^^^
            this.insert(keyEnd, ": " + valueCode);
        }
    };
    return ObjectInitialiserMemberPatcher;
}(ObjectBodyMemberPatcher));
export default ObjectInitialiserMemberPatcher;
