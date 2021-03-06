import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import BinaryOpPatcher from './BinaryOpPatcher';
var EXTENDS_HELPER = "\nfunction __extends__(child, parent) {\n  Object.getOwnPropertyNames(parent).forEach(\n    name => child[name] = parent[name]\n  );\n  child.prototype = Object.create(parent.prototype);\n  child.__super__ = parent.prototype;\n  return child;\n}\n";
/**
 * Handles `extends` infix operator.
 */
var ExtendsOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ExtendsOpPatcher, _super);
    function ExtendsOpPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * CHILD extends PARENT
     */
    ExtendsOpPatcher.prototype.patchAsExpression = function () {
        var helper = this.registerHelper('__extends__', EXTENDS_HELPER);
        this.insert(this.left.outerStart, helper + "(");
        this.left.patch();
        this.overwrite(this.left.outerEnd, this.right.outerStart, ', ');
        this.right.patch();
        this.insert(this.right.outerEnd, ')');
    };
    /**
     * We always prefix with `__extends__`, so no need for parens.
     */
    ExtendsOpPatcher.prototype.statementNeedsParens = function () {
        return false;
    };
    ExtendsOpPatcher.prototype.operatorTokenPredicate = function () {
        // Right now the "extends" token is an identifier rather than a binary
        // operator, so treat it as a special case for this node type.
        return function (token) { return token.type === SourceType.EXTENDS; };
    };
    return ExtendsOpPatcher;
}(BinaryOpPatcher));
export default ExtendsOpPatcher;
