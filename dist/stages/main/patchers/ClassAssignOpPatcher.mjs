import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import containsSuperCall from '../../../utils/containsSuperCall';
import notNull from '../../../utils/notNull';
import ClassBoundMethodFunctionPatcher from './ClassBoundMethodFunctionPatcher';
import ClassPatcher from './ClassPatcher';
import DynamicMemberAccessOpPatcher from './DynamicMemberAccessOpPatcher';
import FunctionPatcher from './FunctionPatcher';
import IdentifierPatcher from './IdentifierPatcher';
import ManuallyBoundFunctionPatcher from './ManuallyBoundFunctionPatcher';
import MemberAccessOpPatcher from './MemberAccessOpPatcher';
import ObjectBodyMemberPatcher from './ObjectBodyMemberPatcher';
import StringPatcher from './StringPatcher';
import ThisPatcher from './ThisPatcher';
var ClassAssignOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ClassAssignOpPatcher, _super);
    function ClassAssignOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClassAssignOpPatcher.patcherClassForChildNode = function (node, property) {
        if (property === 'expression' && node.type === 'BoundFunction') {
            return ClassBoundMethodFunctionPatcher;
        }
        return null;
    };
    /**
     * Don't put semicolons after methods.
     */
    ClassAssignOpPatcher.prototype.statementNeedsSemicolon = function () {
        return !this.isMethod();
    };
    ClassAssignOpPatcher.prototype.patchAsExpression = function () {
        this.markKeyRepeatableIfNecessary();
        if (this.isStaticMethod()) {
            this.insert(this.key.outerStart, 'static ');
        }
        _super.prototype.patchAsExpression.call(this);
        if (this.isStaticMethod()) {
            // `static this.a: ->` → `static a: ->`
            //         ^^^^^
            var replaceEnd = void 0;
            if (this.key instanceof MemberAccessOpPatcher) {
                replaceEnd = this.key.getMemberNameSourceToken().start;
            }
            else if (this.key instanceof DynamicMemberAccessOpPatcher) {
                replaceEnd = this.key.expression.outerEnd;
            }
            else {
                throw this.error('Unexpected static method key type.');
            }
            this.remove(this.key.outerStart, replaceEnd);
        }
    };
    /**
     * If the method name is computed, we'll need to repeat it for any super call
     * that we do, so mark it as repeatable now.
     */
    ClassAssignOpPatcher.prototype.markKeyRepeatableIfNecessary = function () {
        if (this.expression instanceof FunctionPatcher && containsSuperCall(this.expression.node)) {
            if (this.isStaticMethod()) {
                if (this.key instanceof DynamicMemberAccessOpPatcher) {
                    this.key.indexingExpr.setRequiresRepeatableExpression({
                        ref: 'method',
                        forceRepeat: true
                    });
                }
            }
            else {
                this.key.setRequiresRepeatableExpression({
                    ref: 'method',
                    // String interpolations are the only way to have computed keys, so we
                    // need to be defensive in that case. For other cases, like number
                    // literals, we still mark as repeatable so later code can safely get
                    // the repeat code.
                    forceRepeat: this.key instanceof StringPatcher && this.key.expressions.length > 0
                });
            }
        }
    };
    /**
     * @protected
     */
    ClassAssignOpPatcher.prototype.patchKey = function () {
        if (this.isStaticMethod()) {
            // Don't do anything special; the details around this are handled elsewhere.
            this.key.patch();
        }
        else {
            _super.prototype.patchKey.call(this);
        }
    };
    /**
     * @protected
     */
    ClassAssignOpPatcher.prototype.patchAsProperty = function () {
        if (!this.expression) {
            throw this.error('Expected value expression for class assign op.');
        }
        // `name: null` → `name = null`
        //      ^^             ^^^
        var colonIndex = this.indexOfSourceTokenBetweenPatchersMatching(this.key, this.expression, function (token) { return token.type === SourceType.COLON; });
        if (!colonIndex) {
            throw this.error('expected a colon between the key and expression of a class property');
        }
        var colonToken = notNull(this.sourceTokenAtIndex(colonIndex));
        this.overwrite(colonToken.start, colonToken.end, ' =');
        this.patchExpression();
    };
    /**
     * Determines if this class assignment matches the known patterns for static
     * methods in CoffeeScript, i.e.
     *
     *   class A
     *     this.a: ->
     *     @b: ->
     *     A.c: ->
     *
     * Similarly, `this[a]`, `@[b]`, and `A[c]` can all become static methods.
     *
     * @protected
     */
    ClassAssignOpPatcher.prototype.isStaticMethod = function () {
        if (!(this.key instanceof MemberAccessOpPatcher) && !(this.key instanceof DynamicMemberAccessOpPatcher)) {
            return false;
        }
        var memberObject = this.key.expression;
        if (memberObject instanceof ThisPatcher) {
            return true;
        }
        var className = this.getEnclosingClassPatcher().nameAssignee;
        return (className instanceof IdentifierPatcher &&
            memberObject instanceof IdentifierPatcher &&
            className.node.data === className.node.data);
    };
    ClassAssignOpPatcher.prototype.getEnclosingClassPatcher = function () {
        var enclosingClassPatcher = notNull(this.parent).parent;
        if (!(enclosingClassPatcher instanceof ClassPatcher)) {
            throw this.error("Expected parent's parent to be a class.");
        }
        return enclosingClassPatcher;
    };
    ClassAssignOpPatcher.prototype.isBoundInstanceMethod = function () {
        if (!this.expression) {
            throw this.error('Expected value expression for class assign op.');
        }
        return (!this.isStaticMethod() &&
            (this.expression.node.type === 'BoundFunction' || this.expression.node.type === 'BoundGeneratorFunction'));
    };
    /**
     * For classes, unlike in objects, manually bound methods can use regular
     * method syntax because the bind happens in the constructor.
     *
     * @protected
     */
    ClassAssignOpPatcher.prototype.isMethod = function () {
        return this.expression instanceof ManuallyBoundFunctionPatcher || _super.prototype.isMethod.call(this);
    };
    return ClassAssignOpPatcher;
}(ObjectBodyMemberPatcher));
export default ClassAssignOpPatcher;
