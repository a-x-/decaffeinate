"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var suggestions_1 = require("../../../suggestions");
var adjustIndent_1 = require("../../../utils/adjustIndent");
var babelConstructorWorkaroundLines_1 = require("../../../utils/babelConstructorWorkaroundLines");
var getBindingCodeForMethod_1 = require("../../../utils/getBindingCodeForMethod");
var getInvalidConstructorErrorMessage_1 = require("../../../utils/getInvalidConstructorErrorMessage");
var BlockPatcher_1 = require("./BlockPatcher");
var ClassAssignOpPatcher_1 = require("./ClassAssignOpPatcher");
var ClassPatcher_1 = require("./ClassPatcher");
var ConstructorPatcher_1 = require("./ConstructorPatcher");
var ClassBlockPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ClassBlockPatcher, _super);
    function ClassBlockPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClassBlockPatcher.patcherClassForChildNode = function (node, property) {
        if (property === 'statements' && node.type === 'AssignOp') {
            return ClassAssignOpPatcher_1.default;
        }
        return null;
    };
    ClassBlockPatcher.prototype.patch = function (options) {
        if (options === void 0) { options = {}; }
        var e_1, _a, e_2, _b;
        try {
            for (var _c = tslib_1.__values(this.boundInstanceMethods()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var boundMethod = _d.value;
                boundMethod.key.setRequiresRepeatableExpression();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        _super.prototype.patch.call(this, options);
        if (!this.hasConstructor()) {
            var boundMethods = this.boundInstanceMethods();
            if (boundMethods.length > 0) {
                var isSubclass = this.getClassPatcher().isSubclass();
                if (isSubclass && !this.shouldAllowInvalidConstructors()) {
                    throw this.error(getInvalidConstructorErrorMessage_1.default('Cannot automatically convert a subclass that uses bound methods.'));
                }
                var source = this.context.source;
                var insertionPoint = this.statements[0].outerStart;
                var methodIndent = adjustIndent_1.default(source, insertionPoint, 0);
                var methodBodyIndent_1 = adjustIndent_1.default(source, insertionPoint, 1);
                var constructor_1 = '';
                if (isSubclass) {
                    constructor_1 += "constructor(...args) {\n";
                    if (this.shouldEnableBabelWorkaround()) {
                        try {
                            for (var babelConstructorWorkaroundLines_2 = tslib_1.__values(babelConstructorWorkaroundLines_1.default), babelConstructorWorkaroundLines_2_1 = babelConstructorWorkaroundLines_2.next(); !babelConstructorWorkaroundLines_2_1.done; babelConstructorWorkaroundLines_2_1 = babelConstructorWorkaroundLines_2.next()) {
                                var line = babelConstructorWorkaroundLines_2_1.value;
                                constructor_1 += "" + methodBodyIndent_1 + line + "\n";
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (babelConstructorWorkaroundLines_2_1 && !babelConstructorWorkaroundLines_2_1.done && (_b = babelConstructorWorkaroundLines_2.return)) _b.call(babelConstructorWorkaroundLines_2);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                }
                else {
                    constructor_1 += "constructor() {\n";
                }
                boundMethods.forEach(function (method) {
                    constructor_1 += "" + methodBodyIndent_1 + getBindingCodeForMethod_1.default(method) + ";\n";
                });
                if (isSubclass) {
                    constructor_1 += methodBodyIndent_1 + "super(...args)\n";
                }
                constructor_1 += methodIndent + "}\n\n" + methodIndent;
                this.prependLeft(insertionPoint, constructor_1);
            }
        }
    };
    ClassBlockPatcher.prototype.shouldAllowInvalidConstructors = function () {
        return !this.options.disallowInvalidConstructors;
    };
    ClassBlockPatcher.prototype.shouldEnableBabelWorkaround = function () {
        var shouldEnable = !this.options.disableBabelConstructorWorkaround;
        if (shouldEnable) {
            this.addSuggestion(suggestions_1.REMOVE_BABEL_WORKAROUND);
        }
        return shouldEnable;
    };
    ClassBlockPatcher.prototype.getClassPatcher = function () {
        if (!(this.parent instanceof ClassPatcher_1.default)) {
            throw this.error('Expected class block parent to be a class.');
        }
        return this.parent;
    };
    ClassBlockPatcher.prototype.canPatchAsExpression = function () {
        return false;
    };
    ClassBlockPatcher.prototype.hasConstructor = function () {
        return this.statements.some(function (statement) { return statement instanceof ConstructorPatcher_1.default; });
    };
    ClassBlockPatcher.prototype.boundInstanceMethods = function () {
        var e_3, _a;
        var boundMethods = [];
        try {
            for (var _b = tslib_1.__values(this.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var statement = _c.value;
                if (statement instanceof ClassAssignOpPatcher_1.default && statement.isBoundInstanceMethod()) {
                    boundMethods.push(statement);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return boundMethods;
    };
    return ClassBlockPatcher;
}(BlockPatcher_1.default));
exports.default = ClassBlockPatcher;
