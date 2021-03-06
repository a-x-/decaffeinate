"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var getEnclosingScopeBlock_1 = require("../../../utils/getEnclosingScopeBlock");
var notNull_1 = require("../../../utils/notNull");
/**
 * Handles `try` statements, e.g. `try a catch e then console.log(e)`.
 */
var TryPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(TryPatcher, _super);
    function TryPatcher(patcherContext, body, catchAssignee, catchBody, finallyBody) {
        var _this = _super.call(this, patcherContext) || this;
        _this._errorBinding = null;
        _this.body = body;
        _this.catchAssignee = catchAssignee;
        _this.catchBody = catchBody;
        _this.finallyBody = finallyBody;
        return _this;
    }
    TryPatcher.prototype.initialize = function () {
        if (this.catchAssignee) {
            this.catchAssignee.setAssignee();
            this.catchAssignee.setRequiresExpression();
        }
        getEnclosingScopeBlock_1.default(this).markIIFEPatcherDescendant(this);
    };
    TryPatcher.prototype.canPatchAsExpression = function () {
        if (this.body && !this.body.canPatchAsExpression()) {
            return false;
        }
        if (this.catchBody && !this.catchBody.canPatchAsExpression()) {
            return false;
        }
        if (this.finallyBody && !this.finallyBody.canPatchAsExpression()) {
            return false;
        }
        return true;
    };
    /**
     * 'try' BODY ( 'catch' ASSIGNEE? CATCH-BODY? )? ( 'finally' FINALLY-BODY )?
     */
    TryPatcher.prototype.patchAsStatement = function () {
        var tryToken = this.getTryToken();
        var catchToken = this.getCatchToken();
        var thenTokenIndex = this.getThenTokenIndex();
        var finallyToken = this.getFinallyToken();
        // `try a` → `try { a`
        //               ^^
        this.insert(tryToken.end, " {");
        if (this.body) {
            if (this.body.inline()) {
                this.body.patch({ leftBrace: false });
            }
            else {
                if (catchToken || finallyToken) {
                    this.body.patch({ leftBrace: false, rightBrace: false });
                    // `try { a; catch err` → `try { a; } catch err`
                    //                                  ^^
                    this.insert(notNull_1.default(catchToken || finallyToken).start, '} ');
                }
                else {
                    this.body.patch({ leftBrace: false });
                }
            }
        }
        else {
            this.insert(tryToken.end, '}');
        }
        if (thenTokenIndex) {
            var thenToken = notNull_1.default(this.sourceTokenAtIndex(thenTokenIndex));
            var nextToken = this.sourceTokenAtIndex(notNull_1.default(thenTokenIndex.next()));
            // `try { a; } catch err then b` → `try { a; } catch err b`
            //                       ^^^^^
            if (nextToken) {
                this.remove(thenToken.start, nextToken.start);
            }
            else {
                this.remove(thenToken.start, thenToken.end);
            }
        }
        if (catchToken) {
            var afterCatchHeader = this.catchAssignee ? this.catchAssignee.outerEnd : catchToken.end;
            if (this.catchAssignee) {
                var addErrorParens = !this.catchAssignee.isSurroundedByParentheses();
                if (addErrorParens) {
                    // `try { a; } catch err` → `try { a; } catch (err`
                    //                                            ^
                    this.insert(this.catchAssignee.outerStart, '(');
                }
                this.catchAssignee.patch();
                if (addErrorParens) {
                    // `try { a; } catch (err` → `try { a; } catch (err)`
                    //                                                 ^
                    this.insert(this.catchAssignee.outerEnd, ')');
                }
            }
            else {
                // `try { a; } catch` → `try { a; } catch (error)`
                //                                       ^^^^^^^^
                this.insert(afterCatchHeader, " (" + this.getErrorBinding() + ")");
            }
            if (this.catchBody) {
                // `try { a; } catch (error)` → `try { a; } catch (error) {`
                //                                                       ^^
                this.insert(afterCatchHeader, ' {');
                this.catchBody.patch({ leftBrace: false });
            }
            else {
                this.insert(afterCatchHeader, ' {}');
            }
        }
        else if (!finallyToken) {
            // `try { a; }` → `try { a; } catch (error) {}`
            //                           ^^^^^^^^^^^^^^^^^
            var insertPos = this.body ? this.body.innerEnd : tryToken.end;
            this.insert(insertPos, " catch (" + this.getErrorBinding() + ") {}");
        }
        if (finallyToken) {
            if (!this.finallyBody) {
                this.insert(finallyToken.end, ' {}');
            }
            else if (this.finallyBody.inline()) {
                this.finallyBody.patch();
            }
            else {
                // `try { a; } finally b` → `try { a; } finally { b`
                //                                             ^^
                this.insert(finallyToken.end, ' {');
                this.finallyBody.patch({ leftBrace: false });
            }
        }
    };
    TryPatcher.prototype.patchAsExpression = function () {
        var _this = this;
        // Make our children return since we're wrapping in a function.
        this.setImplicitlyReturns();
        this.patchInIIFE(function () {
            _this.insert(_this.innerStart, ' ');
            _this.patchAsStatement();
            _this.insert(_this.innerEnd, ' ');
        });
    };
    TryPatcher.prototype.willPatchAsIIFE = function () {
        return this.willPatchAsExpression();
    };
    TryPatcher.prototype.canHandleImplicitReturn = function () {
        return this.willPatchAsExpression();
    };
    /**
     * If we're a statement, our children can handle implicit return, so no need
     * to convert to an expression.
     */
    TryPatcher.prototype.implicitlyReturns = function () {
        return _super.prototype.implicitlyReturns.call(this) && this.willPatchAsExpression();
    };
    TryPatcher.prototype.setImplicitlyReturns = function () {
        _super.prototype.setImplicitlyReturns.call(this);
        if (this.body) {
            this.body.setImplicitlyReturns();
        }
        if (this.catchBody) {
            this.catchBody.setImplicitlyReturns();
        }
    };
    TryPatcher.prototype.statementNeedsSemicolon = function () {
        return false;
    };
    /**
     * @private
     */
    TryPatcher.prototype.getTryToken = function () {
        var tryTokenIndex = this.contentStartTokenIndex;
        var tryToken = this.sourceTokenAtIndex(tryTokenIndex);
        if (!tryToken || tryToken.type !== coffee_lex_1.SourceType.TRY) {
            throw this.error("expected 'try' keyword at start of 'try' statement");
        }
        return tryToken;
    };
    /**
     * @private
     */
    TryPatcher.prototype.getCatchToken = function () {
        var searchStart;
        if (this.body) {
            searchStart = this.body.outerEnd;
        }
        else {
            searchStart = this.getTryToken().end;
        }
        var searchEnd;
        if (this.catchAssignee) {
            searchEnd = this.catchAssignee.outerStart;
        }
        else if (this.catchBody) {
            searchEnd = this.catchBody.outerStart;
        }
        else if (this.finallyBody) {
            searchEnd = this.finallyBody.outerStart;
        }
        else {
            searchEnd = this.contentEnd;
        }
        var catchTokenIndex = this.indexOfSourceTokenBetweenSourceIndicesMatching(searchStart, searchEnd, function (token) { return token.type === coffee_lex_1.SourceType.CATCH; });
        if (!catchTokenIndex) {
            return null;
        }
        return this.sourceTokenAtIndex(catchTokenIndex);
    };
    /**
     * @private
     */
    TryPatcher.prototype.getThenTokenIndex = function () {
        var searchStart;
        if (this.catchAssignee) {
            searchStart = this.catchAssignee.outerEnd;
        }
        else if (this.body) {
            searchStart = this.body.outerEnd;
        }
        else {
            searchStart = this.getTryToken().end;
        }
        var searchEnd;
        if (this.catchBody) {
            searchEnd = this.catchBody.outerStart;
        }
        else if (this.finallyBody) {
            searchEnd = this.finallyBody.outerStart;
        }
        else {
            // The CoffeeScript AST doesn't always include a "then" in the node range,
            // so look one more token past the end.
            var nextToken = this.nextSemanticToken();
            if (nextToken) {
                searchEnd = nextToken.end;
            }
            else {
                searchEnd = this.contentEnd;
            }
        }
        return this.indexOfSourceTokenBetweenSourceIndicesMatching(searchStart, searchEnd, function (token) { return token.type === coffee_lex_1.SourceType.THEN; });
    };
    /**
     * @private
     */
    TryPatcher.prototype.getFinallyToken = function () {
        var searchStart;
        if (this.catchBody) {
            searchStart = this.catchBody.outerEnd;
        }
        else if (this.catchAssignee) {
            searchStart = this.catchAssignee.outerEnd;
        }
        else if (this.body) {
            searchStart = this.body.outerEnd;
        }
        else {
            searchStart = this.getTryToken().end;
        }
        var searchEnd;
        if (this.finallyBody) {
            searchEnd = this.finallyBody.outerStart;
        }
        else {
            searchEnd = this.contentEnd;
        }
        var finallyTokenIndex = this.indexOfSourceTokenBetweenSourceIndicesMatching(searchStart, searchEnd, function (token) { return token.type === coffee_lex_1.SourceType.FINALLY; });
        if (!finallyTokenIndex) {
            return null;
        }
        return this.sourceTokenAtIndex(finallyTokenIndex);
    };
    /**
     * @private
     */
    TryPatcher.prototype.getErrorBinding = function () {
        if (!this._errorBinding) {
            this._errorBinding = this.claimFreeBinding('error');
        }
        return this._errorBinding;
    };
    return TryPatcher;
}(NodePatcher_1.default));
exports.default = TryPatcher;
