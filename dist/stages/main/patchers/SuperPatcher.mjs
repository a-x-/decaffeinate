import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import extractPrototypeAssignPatchers from '../../../utils/extractPrototypeAssignPatchers';
import notNull from '../../../utils/notNull';
import NodePatcher from './../../../patchers/NodePatcher';
import ClassAssignOpPatcher from './ClassAssignOpPatcher';
import ClassPatcher from './ClassPatcher';
import ConstructorPatcher from './ConstructorPatcher';
import DynamicMemberAccessOpPatcher from './DynamicMemberAccessOpPatcher';
import FunctionPatcher from './FunctionPatcher';
import IdentifierPatcher from './IdentifierPatcher';
import MemberAccessOpPatcher from './MemberAccessOpPatcher';
/**
 * Transform CS super to JS super. For constructors, we can keep the form
 * `super(a, b, c)`, but for methods, we need to insert the method name, e.g.
 * `super.foo(a, b, c)`. However, there are some cases where CS allows super
 * calls but JS doesn't, so in those cases, we find the class and method name
 * using CS's algorithm and insert a more direct prototype method call.
 */
var SuperPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SuperPatcher, _super);
    function SuperPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SuperPatcher.prototype.patchAsExpression = function () {
        var _a = this.getEnclosingMethodInfo(), classCode = _a.classCode, accessCode = _a.accessCode;
        if (this.canConvertToJsSuper()) {
            if (accessCode) {
                this.insert(this.contentEnd, accessCode);
            }
        }
        else {
            if (!accessCode) {
                throw this.error('Cannot handle a super call in an inner function in a constructor. ' +
                    'Please either rewrite your CoffeeScript code to not use this ' +
                    'construct or file a bug to discuss ways that decaffeinate could ' +
                    'handle this case.');
            }
            if (!classCode) {
                throw this.error('Complex super calls within anonymous classes are not yet supported.');
            }
            var openParenToken = this.getFollowingOpenParenToken();
            // Note that this code snippet works for instance methods but not static
            // methods. Static methods that require the expanded call form like this
            // have already been converted in the normalize step.
            this.overwrite(this.contentStart, openParenToken.end, classCode + ".prototype.__proto__" + accessCode + ".call(this, ");
        }
    };
    /**
     * @private
     */
    SuperPatcher.prototype.getEnclosingMethodInfo = function () {
        var methodAssignment = this.getEnclosingMethodAssignment();
        if (methodAssignment instanceof ClassAssignOpPatcher) {
            var accessCode = void 0;
            if (methodAssignment.isStaticMethod()) {
                if (methodAssignment.key instanceof MemberAccessOpPatcher) {
                    accessCode = "." + methodAssignment.key.node.member.data;
                }
                else if (methodAssignment.key instanceof DynamicMemberAccessOpPatcher) {
                    accessCode = "[" + methodAssignment.key.indexingExpr.getRepeatCode() + "]";
                }
                else {
                    throw this.error('Unexpected key type for static method.');
                }
            }
            else {
                if (methodAssignment.key instanceof IdentifierPatcher) {
                    accessCode = "." + methodAssignment.key.node.data;
                }
                else {
                    accessCode = "[" + methodAssignment.key.getRepeatCode() + "]";
                }
            }
            return {
                classCode: this.getEnclosingClassName(methodAssignment),
                accessCode: accessCode
            };
        }
        else if (methodAssignment instanceof ConstructorPatcher) {
            return {
                classCode: this.getEnclosingClassName(methodAssignment),
                accessCode: null
            };
        }
        else {
            var methodInfo = this.getPrototypeAssignInfo(methodAssignment);
            if (!methodInfo) {
                throw this.error('Expected a valid method assignment from getEnclosingMethodAssignment.');
            }
            return methodInfo;
        }
    };
    /**
     * @private
     */
    SuperPatcher.prototype.getEnclosingClassName = function (patcher) {
        var parent = patcher.parent;
        while (parent) {
            if (parent instanceof ClassPatcher) {
                // Note that this may be null if this is an anonymous class. In that
                // case, it's still possible, but harder, to generate code that lets us
                // reference the current class.
                return parent.getName();
            }
            parent = parent.parent;
        }
        throw this.error('Expected super expression to be in a class body.');
    };
    /**
     * @private
     */
    SuperPatcher.prototype.getEnclosingMethodAssignment = function () {
        var parent = this.parent;
        while (parent) {
            if (parent instanceof ClassAssignOpPatcher ||
                parent instanceof ConstructorPatcher ||
                this.getPrototypeAssignInfo(parent) !== null) {
                return parent;
            }
            parent = parent.parent;
        }
        throw this.error('super called in a context where we cannot determine the class and method name.');
    };
    /**
     * Extract the 'A' and 'b' from a node like `A.prototype.b = -> c`, if it
     * matches that form. Return null otherwise.
     *
     * @private
     */
    SuperPatcher.prototype.getPrototypeAssignInfo = function (patcher) {
        var prototypeAssignPatchers = extractPrototypeAssignPatchers(patcher);
        if (!prototypeAssignPatchers) {
            return null;
        }
        var classRefPatcher = prototypeAssignPatchers.classRefPatcher, methodAccessPatcher = prototypeAssignPatchers.methodAccessPatcher;
        if (methodAccessPatcher instanceof MemberAccessOpPatcher) {
            return {
                classCode: classRefPatcher.getRepeatCode(),
                accessCode: "." + methodAccessPatcher.member.node.data
            };
        }
        else if (methodAccessPatcher instanceof DynamicMemberAccessOpPatcher) {
            return {
                classCode: classRefPatcher.getRepeatCode(),
                accessCode: "[" + methodAccessPatcher.indexingExpr.getRepeatCode() + "]"
            };
        }
        else {
            throw this.error('Expected the method access patcher to be either ' + 'MemberAccessOpPatcher or DynamicMemberAccessOpPatcher.');
        }
    };
    /**
     * JavaScript super is more limited than CoffeeScript super, so in some cases
     * we need to write out an expanded version that uses the method on the
     * prototype. In particular:
     *
     * - CoffeeScript allows method assignments like `A::b = -> super`, and is
     *   able to determine the class and method name from code written like this.
     * - CoffeeScript allows `super` from nested methods (which end up compiling
     *   to use whatever `arguments` is relevant at that point in code if the
     *   `super` is written without args).
     *
     * @private
     */
    SuperPatcher.prototype.canConvertToJsSuper = function () {
        var methodAssignment = this.getEnclosingMethodAssignment();
        if (methodAssignment instanceof ConstructorPatcher || methodAssignment instanceof ClassAssignOpPatcher) {
            return methodAssignment.expression === this.getEnclosingFunction();
        }
        return false;
    };
    /**
     * @private
     */
    SuperPatcher.prototype.getEnclosingFunction = function () {
        var parent = this.parent;
        while (parent) {
            if (parent instanceof FunctionPatcher) {
                return parent;
            }
            parent = parent.parent;
        }
        throw this.error('super called outside of a function.');
    };
    /**
     * @private
     */
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
