"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var notNull_1 = require("../../../utils/notNull");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var FunctionApplicationPatcher_1 = require("./FunctionApplicationPatcher");
var FunctionPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(FunctionPatcher, _super);
    function FunctionPatcher(patcherContext, parameters, body) {
        var _this = _super.call(this, patcherContext) || this;
        _this._implicitReturnsDisabled = false;
        _this.parameters = parameters;
        _this.body = body;
        return _this;
    }
    FunctionPatcher.prototype.initialize = function () {
        if (this.body && !this.implicitReturnsDisabled()) {
            this.body.setImplicitlyReturns();
        }
        this.parameters.forEach(function (param) {
            param.setAssignee();
            param.setRequiresExpression();
        });
    };
    FunctionPatcher.prototype.patchAsExpression = function (_a) {
        var _this = this;
        var _b = (_a === void 0 ? {} : _a).method, method = _b === void 0 ? false : _b;
        this.patchFunctionStart({ method: method });
        this.parameters.forEach(function (parameter, i) {
            var isLast = i === _this.parameters.length - 1;
            var needsComma = !isLast && !parameter.hasSourceTokenAfter(coffee_lex_1.SourceType.COMMA);
            parameter.patch();
            if (needsComma) {
                _this.insert(parameter.outerEnd, ',');
            }
        });
        this.patchFunctionBody();
    };
    FunctionPatcher.prototype.patchFunctionStart = function (_a) {
        var _b = _a.method, method = _b === void 0 ? false : _b;
        var arrow = this.getArrowToken();
        if (!method) {
            this.insert(this.contentStart, 'function');
        }
        if (!this.hasParamStart()) {
            this.insert(this.contentStart, '() ');
        }
        this.overwrite(arrow.start, arrow.end, '{');
    };
    FunctionPatcher.prototype.patchFunctionBody = function () {
        if (this.body) {
            if (this.isSurroundedByParentheses()) {
                this.body.patch({ leftBrace: false, rightBrace: false });
                this.insert(this.innerEnd, this.body.inline() ? ' }' : '}');
            }
            else if (this.isEndOfFunctionCall()) {
                this.body.patch({ leftBrace: false, rightBrace: false });
                this.placeCloseBraceBeforeFunctionCallEnd();
            }
            else {
                this.body.patch({ leftBrace: false });
            }
        }
        else {
            // No body, so BlockPatcher can't insert it for us.
            this.insert(this.innerEnd, '}');
        }
    };
    FunctionPatcher.prototype.isEndOfFunctionCall = function () {
        return this.parent instanceof FunctionApplicationPatcher_1.default && this.parent.args[this.parent.args.length - 1] === this;
    };
    /**
     * If we're the last argument to a function, place the } just before the
     * close-paren. There will always be a close-paren because all implicit
     * parentheses were added in the normalize stage.
     *
     * However, if the close-paren is at the end of our line, it usually looks
     * better to put the }) on the next line instead.
     */
    FunctionPatcher.prototype.placeCloseBraceBeforeFunctionCallEnd = function () {
        if (!this.body) {
            throw this.error('Expected non-null body.');
        }
        var closeParenIndex = notNull_1.default(this.parent).indexOfSourceTokenBetweenSourceIndicesMatching(this.contentEnd, notNull_1.default(this.parent).contentEnd, function (token) { return token.type === coffee_lex_1.SourceType.CALL_END || token.type === coffee_lex_1.SourceType.RPAREN; });
        if (!closeParenIndex) {
            throw this.error('Expected to find close paren index after function call.');
        }
        var closeParen = this.sourceTokenAtIndex(closeParenIndex);
        if (!closeParen) {
            throw this.error('Expected to find close paren after function call.');
        }
        var shouldMoveCloseParen = !this.body.inline() && !this.slice(this.contentEnd, closeParen.start).includes('\n');
        if (shouldMoveCloseParen) {
            this.appendLineAfter('}', -1);
        }
        else {
            this.insert(closeParen.start, this.body.inline() ? ' }' : '}');
        }
    };
    FunctionPatcher.prototype.getArrowToken = function () {
        var arrowIndex = this.contentStartTokenIndex;
        if (this.hasParamStart()) {
            var parenRange = this.getProgramSourceTokens().rangeOfMatchingTokensContainingTokenIndex(coffee_lex_1.SourceType.LPAREN, coffee_lex_1.SourceType.RPAREN, this.contentStartTokenIndex);
            if (!parenRange) {
                throw this.error('Expected to find function paren range in function.');
            }
            var rparenIndex = parenRange[1].previous();
            if (!rparenIndex) {
                throw this.error('Expected to find rparen index in function.');
            }
            arrowIndex = notNull_1.default(this.indexOfSourceTokenAfterSourceTokenIndex(rparenIndex, coffee_lex_1.SourceType.FUNCTION));
        }
        var arrow = this.sourceTokenAtIndex(arrowIndex);
        if (!arrow) {
            throw this.error('Expected to find arrow token in function.');
        }
        var expectedArrowType = this.expectedArrowType();
        var actualArrowType = this.sourceOfToken(arrow);
        if (actualArrowType !== expectedArrowType) {
            throw this.error("expected '" + expectedArrowType + "' but found " + actualArrowType, arrow.start, arrow.end);
        }
        return arrow;
    };
    FunctionPatcher.prototype.expectedArrowType = function () {
        return '->';
    };
    FunctionPatcher.prototype.hasParamStart = function () {
        return notNull_1.default(this.sourceTokenAtIndex(this.contentStartTokenIndex)).type === coffee_lex_1.SourceType.LPAREN;
    };
    FunctionPatcher.prototype.canHandleImplicitReturn = function () {
        return true;
    };
    FunctionPatcher.prototype.setExplicitlyReturns = function () {
        // Stop propagation of return info at functions.
    };
    /**
     * Call before initialization to prevent this function from implicitly
     * returning its last statement.
     */
    FunctionPatcher.prototype.disableImplicitReturns = function () {
        this._implicitReturnsDisabled = true;
    };
    /**
     * Determines whether this function has implicit returns disabled.
     */
    FunctionPatcher.prototype.implicitReturnsDisabled = function () {
        return this._implicitReturnsDisabled;
    };
    /**
     * Functions in CoffeeScript are always anonymous and therefore need parens.
     */
    FunctionPatcher.prototype.statementNeedsParens = function () {
        return true;
    };
    return FunctionPatcher;
}(NodePatcher_1.default));
exports.default = FunctionPatcher;
