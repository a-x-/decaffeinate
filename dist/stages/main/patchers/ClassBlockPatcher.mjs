import * as tslib_1 from "tslib";
import { REMOVE_BABEL_WORKAROUND } from '../../../suggestions';
import adjustIndent from '../../../utils/adjustIndent';
import babelConstructorWorkaroundLines from '../../../utils/babelConstructorWorkaroundLines';
import getBindingCodeForMethod from '../../../utils/getBindingCodeForMethod';
import getInvalidConstructorErrorMessage from '../../../utils/getInvalidConstructorErrorMessage';
import BlockPatcher from './BlockPatcher';
import ClassAssignOpPatcher from './ClassAssignOpPatcher';
import ClassPatcher from './ClassPatcher';
import ConstructorPatcher from './ConstructorPatcher';
var ClassBlockPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ClassBlockPatcher, _super);
    function ClassBlockPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClassBlockPatcher.patcherClassForChildNode = function (node, property) {
        if (property === 'statements' && node.type === 'AssignOp') {
            return ClassAssignOpPatcher;
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
                    throw this.error(getInvalidConstructorErrorMessage('Cannot automatically convert a subclass that uses bound methods.'));
                }
                var source = this.context.source;
                var insertionPoint = this.statements[0].outerStart;
                var methodIndent = adjustIndent(source, insertionPoint, 0);
                var methodBodyIndent_1 = adjustIndent(source, insertionPoint, 1);
                var constructor_1 = '';
                if (isSubclass) {
                    constructor_1 += "constructor(...args) {\n";
                    if (this.shouldEnableBabelWorkaround()) {
                        try {
                            for (var babelConstructorWorkaroundLines_1 = tslib_1.__values(babelConstructorWorkaroundLines), babelConstructorWorkaroundLines_1_1 = babelConstructorWorkaroundLines_1.next(); !babelConstructorWorkaroundLines_1_1.done; babelConstructorWorkaroundLines_1_1 = babelConstructorWorkaroundLines_1.next()) {
                                var line = babelConstructorWorkaroundLines_1_1.value;
                                constructor_1 += "" + methodBodyIndent_1 + line + "\n";
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (babelConstructorWorkaroundLines_1_1 && !babelConstructorWorkaroundLines_1_1.done && (_b = babelConstructorWorkaroundLines_1.return)) _b.call(babelConstructorWorkaroundLines_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                }
                else {
                    constructor_1 += "constructor() {\n";
                }
                boundMethods.forEach(function (method) {
                    constructor_1 += "" + methodBodyIndent_1 + getBindingCodeForMethod(method) + ";\n";
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
            this.addSuggestion(REMOVE_BABEL_WORKAROUND);
        }
        return shouldEnable;
    };
    ClassBlockPatcher.prototype.getClassPatcher = function () {
        if (!(this.parent instanceof ClassPatcher)) {
            throw this.error('Expected class block parent to be a class.');
        }
        return this.parent;
    };
    ClassBlockPatcher.prototype.canPatchAsExpression = function () {
        return false;
    };
    ClassBlockPatcher.prototype.hasConstructor = function () {
        return this.statements.some(function (statement) { return statement instanceof ConstructorPatcher; });
    };
    ClassBlockPatcher.prototype.boundInstanceMethods = function () {
        var e_3, _a;
        var boundMethods = [];
        try {
            for (var _b = tslib_1.__values(this.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var statement = _c.value;
                if (statement instanceof ClassAssignOpPatcher && statement.isBoundInstanceMethod()) {
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
}(BlockPatcher));
export default ClassBlockPatcher;
