import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import notNull from '../../../utils/notNull';
import NodePatcher from './../../../patchers/NodePatcher';
import AssignOpPatcher from './AssignOpPatcher';
import ClassPatcher from './ClassPatcher';
var SuperPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SuperPatcher, _super);
    function SuperPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SuperPatcher.prototype.patchAsExpression = function () {
        var earlyTransformInfo = this.getEarlyTransformInfo();
        if (earlyTransformInfo) {
            this.patchEarlySuperTransform(earlyTransformInfo);
        }
        else if (this.node.type === 'BareSuperFunctionApplication') {
            this.insert(this.contentEnd, '(arguments...)');
        }
    };
    /**
     * When dynamically defining a static method on a class, we need to handle any
     * super calls in the normalize stage. Otherwise, the code will move into an
     * initClass method and super calls will refer to super.initClass.
     */
    SuperPatcher.prototype.patchEarlySuperTransform = function (_a) {
        var classCode = _a.classCode, accessCode = _a.accessCode;
        // Note that this code snippet works for static methods but not instance
        // methods. Expanded super calls for instance methods are handled in the
        // main stage.
        var replacement = classCode + ".__proto__" + accessCode + ".call(this, ";
        if (this.node.type === 'BareSuperFunctionApplication') {
            this.overwrite(this.contentStart, this.contentEnd, replacement + "arguments...)");
        }
        else {
            var followingOpenParen = this.getFollowingOpenParenToken();
            this.overwrite(this.contentStart, followingOpenParen.end, replacement);
        }
    };
    SuperPatcher.prototype.getEarlyTransformInfo = function () {
        var parent = this.parent;
        while (parent) {
            if (parent instanceof AssignOpPatcher) {
                var earlyTransformInfo = parent.getEarlySuperTransformInfo();
                if (earlyTransformInfo) {
                    return earlyTransformInfo;
                }
            }
            else if (parent instanceof ClassPatcher) {
                return null;
            }
            parent = parent.parent;
        }
        return null;
    };
    SuperPatcher.prototype.getFollowingOpenParenToken = function () {
        var openParenTokenIndex = this.indexOfSourceTokenAfterSourceTokenIndex(this.contentEndTokenIndex, SourceType.CALL_START);
        if (!openParenTokenIndex) {
            throw this.error('Expected open-paren after super.');
        }
        return notNull(this.sourceTokenAtIndex(openParenTokenIndex));
    };
    return SuperPatcher;
}(NodePatcher));
export default SuperPatcher;
