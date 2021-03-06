"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var nodes_1 = require("decaffeinate-parser/dist/nodes");
var normalizeListItem_1 = require("../../../utils/normalizeListItem");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var FunctionApplicationPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(FunctionApplicationPatcher, _super);
    function FunctionApplicationPatcher(patcherContext, fn, args) {
        var _this = _super.call(this, patcherContext) || this;
        _this.fn = fn;
        _this.args = args;
        return _this;
    }
    FunctionApplicationPatcher.prototype.patchAsExpression = function () {
        var e_1, _a;
        var implicitCall = this.isImplicitCall();
        var args = this.args;
        this.fn.patch();
        if (implicitCall) {
            var firstArg = args[0];
            var firstArgIsOnNextLine = !firstArg
                ? false
                : /\n/.test(this.context.source.slice(this.fn.outerEnd, firstArg.outerStart));
            var funcEnd = this.getFuncEnd();
            if (firstArgIsOnNextLine) {
                this.insert(funcEnd, '(');
            }
            else {
                this.overwrite(funcEnd, firstArg.outerStart, '(');
            }
        }
        try {
            for (var _b = tslib_1.__values(args.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 2), i = _d[0], arg = _d[1];
                arg.patch();
                normalizeListItem_1.default(this, arg, args[i + 1]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (implicitCall) {
            this.insertImplicitCloseParen();
        }
    };
    /**
     * We need to be careful when inserting the close-paren after a function call,
     * since an incorrectly-placed close-paren can cause a parsing error in the
     * MainStage due to subtle indentation rules in the CoffeeScript parser.
     *
     * In particular, we prefer to place the close paren after an existing } or ],
     * or before an existing ), if we can, since that is least likely to confuse
     * any indentation parsing. But in some cases it's best to instead insert the
     * close-paren properly-indented on its own line.
     */
    FunctionApplicationPatcher.prototype.insertImplicitCloseParen = function () {
        if (this.fn.node instanceof nodes_1.CSXElement && !this.fn.isSurroundedByParentheses()) {
            // Strangely, `<div /> arg` is allowed but `<div />(arg)` is not, so change to (<div />)(arg).
            this.fn.surroundInParens();
        }
        var argListCode = this.slice(this.args[0].contentStart, this.args[this.args.length - 1].contentEnd);
        var isArgListMultiline = argListCode.indexOf('\n') !== -1;
        var lastTokenType = this.lastToken().type;
        if (!isArgListMultiline || lastTokenType === coffee_lex_1.SourceType.RBRACE || lastTokenType === coffee_lex_1.SourceType.RBRACKET) {
            this.insert(this.contentEnd, ')');
            return;
        }
        var followingCloseParen = this.getFollowingCloseParenIfExists();
        if (followingCloseParen) {
            // In some cases, (e.g. within function args) our bounds are extended to
            // allow us to patch the close-paren all the way up to the start of the
            // following close-paren, but don't patch past the end of those bounds.
            this.insert(Math.min(followingCloseParen.start, this.getMaxCloseParenInsertPoint()), ')');
            return;
        }
        var args = this.args;
        var lastArg = args[args.length - 1];
        if (lastArg.isMultiline()) {
            // The CoffeeScript compiler will sometimes reject `.` that is starting a
            // new line following a `)` token. Also, in some cases, it will complain
            // about an indentation error if the `)` is too far indented. So handle
            // this case by moving the `.` to be right after the new `)`.
            var nextSemanticToken = this.getFirstSemanticToken(this.contentEnd);
            if (nextSemanticToken && nextSemanticToken.type === coffee_lex_1.SourceType.DOT) {
                this.overwrite(this.outerEnd, nextSemanticToken.start, ')');
            }
            else {
                this.insert(this.contentEnd, "\n" + this.getIndent() + ")");
            }
            return;
        }
        this.insert(this.contentEnd, ')');
    };
    FunctionApplicationPatcher.prototype.getFollowingCloseParenIfExists = function () {
        var tokenIndex = this.contentEndTokenIndex;
        var token;
        do {
            var nextTokenIndex = tokenIndex.next();
            if (nextTokenIndex === null) {
                return null;
            }
            tokenIndex = nextTokenIndex;
            token = this.sourceTokenAtIndex(tokenIndex);
            if (token === null) {
                return null;
            }
        } while (token.type === coffee_lex_1.SourceType.NEWLINE);
        if (token.type === coffee_lex_1.SourceType.CALL_END || token.type === coffee_lex_1.SourceType.RPAREN) {
            return token;
        }
        return null;
    };
    /**
     * Normally we can edit up to the end of our editing bounds (but no further),
     * but be especially careful here to not place a close-paren before the
     * indentation level of our statement.
     */
    FunctionApplicationPatcher.prototype.getMaxCloseParenInsertPoint = function () {
        var maxInsertionPoint = this.getEditingBounds()[1];
        var enclosingIndentedPatcher = this;
        while (!enclosingIndentedPatcher.isFirstNodeInLine(enclosingIndentedPatcher.contentStart) &&
            enclosingIndentedPatcher.parent) {
            enclosingIndentedPatcher = enclosingIndentedPatcher.parent;
        }
        return Math.min(maxInsertionPoint, enclosingIndentedPatcher.contentEnd);
    };
    /**
     * Determine if parens need to be inserted. Needs to handle implicit soaked
     * function calls (where there's a question mark between the function and the
     * args).
     *
     * Note that we do not add parentheses for constructor invocations with no
     * arguments and no parentheses; that usage is correct in JavaScript, so we
     * leave it as-is.
     */
    FunctionApplicationPatcher.prototype.isImplicitCall = function () {
        if (this.args.length === 0) {
            return false;
        }
        var searchStart = this.fn.outerEnd;
        var searchEnd = this.args[0].outerStart;
        return (this.indexOfSourceTokenBetweenSourceIndicesMatching(searchStart, searchEnd, function (token) { return token.type === coffee_lex_1.SourceType.CALL_START; }) === null);
    };
    /**
     * Get the source index after the function and the question mark, if any.
     * This is the start of the region to insert an open-paren if necessary
     */
    FunctionApplicationPatcher.prototype.getFuncEnd = function () {
        if (this.node.type === 'SoakedFunctionApplication' || this.node.type === 'SoakedNewOp') {
            var questionMarkTokenIndex = this.indexOfSourceTokenAfterSourceTokenIndex(this.fn.outerEndTokenIndex, coffee_lex_1.SourceType.EXISTENCE);
            if (!questionMarkTokenIndex) {
                throw this.error('Expected to find question mark token index.');
            }
            var questionMarkToken = this.sourceTokenAtIndex(questionMarkTokenIndex);
            if (!questionMarkToken) {
                throw this.error('Expected to find question mark token.');
            }
            return questionMarkToken.end;
        }
        else {
            return this.fn.outerEnd;
        }
    };
    return FunctionApplicationPatcher;
}(NodePatcher_1.default));
exports.default = FunctionApplicationPatcher;
