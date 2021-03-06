import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import NodePatcher from '../../../patchers/NodePatcher';
import notNull from '../../../utils/notNull';
import AssignOpPatcher from './AssignOpPatcher';
import DefaultParamPatcher from './DefaultParamPatcher';
import FunctionPatcher from './FunctionPatcher';
import IdentifierPatcher from './IdentifierPatcher';
var DoOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(DoOpPatcher, _super);
    function DoOpPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        return _this;
    }
    DoOpPatcher.prototype.initialize = function () {
        this.expression.setRequiresExpression();
    };
    DoOpPatcher.prototype.patchAsExpression = function () {
        var _this = this;
        var doTokenIndex = this.getDoTokenIndex();
        var doToken = notNull(this.sourceTokenAtIndex(doTokenIndex));
        var nextToken = notNull(this.sourceTokenAtIndex(notNull(doTokenIndex.next())));
        this.remove(doToken.start, nextToken.start);
        var addParens = !(this.expression instanceof IdentifierPatcher);
        if (addParens) {
            this.insert(this.contentStart, '(');
        }
        this.expression.patch();
        if (addParens) {
            this.insert(this.innerEnd, ')');
        }
        var args = [];
        if (this.hasDoFunction()) {
            var func = this.getDoFunction();
            func.parameters.forEach(function (param) {
                if (param instanceof DefaultParamPatcher) {
                    var valueSource = param.value.getPatchedSource();
                    _this.remove(param.param.outerEnd, param.value.outerEnd);
                    args.push(valueSource);
                }
                else {
                    args.push(param.getPatchedSource());
                }
            });
        }
        this.insert(this.innerEnd, "(" + args.join(', ') + ")");
    };
    /**
     * Determine whether there is a "do function"--that is, a function where we
     * should change default params to arguments to the do call.
     */
    DoOpPatcher.prototype.hasDoFunction = function () {
        return (this.expression instanceof FunctionPatcher ||
            (this.expression instanceof AssignOpPatcher && this.expression.expression instanceof FunctionPatcher));
    };
    DoOpPatcher.prototype.getDoFunction = function () {
        if (this.expression instanceof FunctionPatcher) {
            return this.expression;
        }
        else if (this.expression instanceof AssignOpPatcher && this.expression.expression instanceof FunctionPatcher) {
            return this.expression.expression;
        }
        else {
            throw this.error('Should only call getDoFunction if hasDoFunction is true.');
        }
    };
    /**
     * @private
     */
    DoOpPatcher.prototype.getDoTokenIndex = function () {
        var index = this.contentStartTokenIndex;
        var token = this.sourceTokenAtIndex(index);
        if (!token || token.type !== SourceType.DO) {
            throw this.error("expected 'do' at start of expression");
        }
        return index;
    };
    return DoOpPatcher;
}(NodePatcher));
export default DoOpPatcher;
