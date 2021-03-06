"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var isReservedWord_1 = require("../../../utils/isReservedWord");
var notNull_1 = require("../../../utils/notNull");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var ClassBlockPatcher_1 = require("./ClassBlockPatcher");
var IdentifierPatcher_1 = require("./IdentifierPatcher");
var MemberAccessOpPatcher_1 = require("./MemberAccessOpPatcher");
var ClassPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ClassPatcher, _super);
    function ClassPatcher(patcherContext, nameAssignee, parent, body) {
        var _this = _super.call(this, patcherContext) || this;
        _this.nameAssignee = nameAssignee;
        _this.superclass = parent;
        _this.body = body;
        return _this;
    }
    ClassPatcher.patcherClassForChildNode = function (_node, property) {
        if (property === 'body') {
            return ClassBlockPatcher_1.default;
        }
        return null;
    };
    ClassPatcher.prototype.initialize = function () {
        if (this.nameAssignee) {
            this.nameAssignee.setRequiresExpression();
        }
        if (this.superclass) {
            this.superclass.setRequiresExpression();
        }
    };
    ClassPatcher.prototype.patchAsStatement = function () {
        var hasParens = this.isSurroundedByParentheses();
        var anonymous = this.isAnonymous();
        if (anonymous && !hasParens) {
            // `class` → `(class`
            //            ^
            this.insert(this.innerStart, '(');
        }
        this.patchAsExpression();
        if (anonymous && !hasParens) {
            // `(class` → `(class)`
            //                   ^
            this.insert(this.innerEnd, ')');
        }
    };
    ClassPatcher.prototype.patchAsExpression = function (_a) {
        var _b = (_a === void 0 ? {} : _a).skipParens, skipParens = _b === void 0 ? false : _b;
        var needsAssignment = this.nameAssignee && (this.isNamespaced() || this.isNameAlreadyDeclared() || this.willPatchAsExpression());
        var needsParens = !skipParens && needsAssignment && this.willPatchAsExpression() && !this.isSurroundedByParentheses();
        if (needsParens) {
            this.insert(this.contentStart, '(');
        }
        if (needsAssignment && this.nameAssignee) {
            var classToken = this.getClassToken();
            // `class A.B` → `A.B`
            //  ^^^^^^
            this.remove(classToken.start, this.nameAssignee.outerStart);
            var name = this.getName();
            if (name) {
                // `A.B` → `A.B = class B`
                //             ^^^^^^^^^^
                this.insert(this.nameAssignee.outerEnd, " = class " + this.getName());
            }
            else {
                // `A[0]` → `A[0] = class`
                //               ^^^^^^^^
                this.insert(this.nameAssignee.outerEnd, " = class");
            }
        }
        if (this.nameAssignee) {
            this.nameAssignee.patch();
        }
        if (this.superclass) {
            this.superclass.patch();
        }
        if (!this.body) {
            // `class A` → `class A {}`
            //                     ^^^
            this.insert(this.innerEnd, ' {}');
        }
        else {
            // `class A` → `class A {`
            //                     ^^
            this.insert(this.getBraceInsertionOffset(), ' {');
            this.body.patch({ leftBrace: false });
        }
        if (needsParens) {
            this.insert(this.innerEnd, ')');
        }
    };
    ClassPatcher.prototype.statementNeedsSemicolon = function () {
        return this.isAnonymous() || this.isNamespaced();
    };
    /**
     * Classes, like functions, only need parens as statements when anonymous.
     */
    ClassPatcher.prototype.statementNeedsParens = function () {
        return this.isAnonymous();
    };
    /**
     * @private
     */
    ClassPatcher.prototype.getClassToken = function () {
        var tokens = this.context.sourceTokens;
        var classSourceToken = notNull_1.default(tokens.tokenAtIndex(this.contentStartTokenIndex));
        if (classSourceToken.type !== coffee_lex_1.SourceType.CLASS) {
            throw this.error("expected CLASS token but found " + coffee_lex_1.SourceType[classSourceToken.type], classSourceToken.start, classSourceToken.end);
        }
        return classSourceToken;
    };
    /**
     * @private
     */
    ClassPatcher.prototype.isAnonymous = function () {
        return this.nameAssignee === null;
    };
    /**
     * @private
     */
    ClassPatcher.prototype.isNamespaced = function () {
        return !this.isAnonymous() && !(this.nameAssignee instanceof IdentifierPatcher_1.default);
    };
    /**
     * Determine if the name of this class already has a declaration earlier. If
     * so, we want to emit an assignment-style class instead of a class
     * declaration.
     */
    ClassPatcher.prototype.isNameAlreadyDeclared = function () {
        var name = this.getName();
        return this.nameAssignee !== null && name !== null && this.getScope().getBinding(name) !== this.nameAssignee.node;
    };
    /**
     * @private
     */
    ClassPatcher.prototype.getName = function () {
        var nameAssignee = this.nameAssignee;
        var name;
        if (nameAssignee instanceof IdentifierPatcher_1.default) {
            name = nameAssignee.node.data;
        }
        else if (nameAssignee instanceof MemberAccessOpPatcher_1.default) {
            name = nameAssignee.node.member.data;
        }
        else {
            name = null;
        }
        if (name !== null && isReservedWord_1.isForbiddenJsName(name)) {
            name = "_" + name;
        }
        return name;
    };
    ClassPatcher.prototype.isSubclass = function () {
        return this.superclass !== null;
    };
    /**
     * @private
     */
    ClassPatcher.prototype.getBraceInsertionOffset = function () {
        if (this.superclass) {
            return this.superclass.outerEnd;
        }
        if (this.nameAssignee) {
            return this.nameAssignee.outerEnd;
        }
        return this.getClassToken().end;
    };
    return ClassPatcher;
}(NodePatcher_1.default));
exports.default = ClassPatcher;
