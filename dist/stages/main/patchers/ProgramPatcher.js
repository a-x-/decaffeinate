"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var SharedProgramPatcher_1 = require("../../../patchers/SharedProgramPatcher");
var getIndent_1 = require("../../../utils/getIndent");
var notNull_1 = require("../../../utils/notNull");
var BLOCK_COMMENT_DELIMITER = '###';
var ProgramPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ProgramPatcher, _super);
    function ProgramPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProgramPatcher.prototype.canPatchAsExpression = function () {
        return false;
    };
    ProgramPatcher.prototype.patchAsStatement = function () {
        this.patchComments();
        this.patchContinuations();
        if (this.body) {
            this.body.patch({ leftBrace: false, rightBrace: false });
        }
        this.patchHelpers();
    };
    /**
     * Removes continuation tokens (i.e. '\' at the end of a line).
     *
     * @private
     */
    ProgramPatcher.prototype.patchContinuations = function () {
        var _this = this;
        this.getProgramSourceTokens().forEach(function (token) {
            if (token.type === coffee_lex_1.SourceType.CONTINUATION) {
                _this.remove(token.start, token.end);
            }
        });
    };
    /**
     * Replaces CoffeeScript style comments with JavaScript style comments.
     *
     * @private
     */
    ProgramPatcher.prototype.patchComments = function () {
        var _this = this;
        var source = this.context.source;
        this.getProgramSourceTokens().forEach(function (token) {
            if (token.type === coffee_lex_1.SourceType.COMMENT) {
                if (token.start === 0 && source[1] === '!') {
                    _this.patchShebangComment(token);
                }
                else {
                    _this.patchLineComment(token);
                }
            }
            else if (token.type === coffee_lex_1.SourceType.HERECOMMENT) {
                _this.patchBlockComment(token);
            }
        });
    };
    /**
     * Patches a block comment.
     *
     * @private
     */
    ProgramPatcher.prototype.patchBlockComment = function (comment) {
        var _this = this;
        var start = comment.start, end = comment.end;
        this.overwrite(start, start + BLOCK_COMMENT_DELIMITER.length, '/*');
        var atStartOfLine = false;
        var lastStartOfLine = null;
        var lineUpAsterisks = true;
        var isMultiline = false;
        var source = this.context.source;
        var expectedIndent = getIndent_1.default(source, start);
        var leadingHashIndexes = [];
        for (var index = start + BLOCK_COMMENT_DELIMITER.length; index < end - BLOCK_COMMENT_DELIMITER.length; index++) {
            switch (source[index]) {
                case '\n':
                    isMultiline = true;
                    atStartOfLine = true;
                    lastStartOfLine = index + '\n'.length;
                    break;
                case ' ':
                case '\t':
                    break;
                case '#':
                    if (atStartOfLine) {
                        leadingHashIndexes.push(index);
                        atStartOfLine = false;
                        if (source.slice(notNull_1.default(lastStartOfLine), index) !== expectedIndent) {
                            lineUpAsterisks = false;
                        }
                    }
                    break;
                default:
                    if (atStartOfLine) {
                        atStartOfLine = false;
                        lineUpAsterisks = false;
                    }
                    break;
            }
        }
        leadingHashIndexes.forEach(function (index) {
            _this.overwrite(index, index + '#'.length, lineUpAsterisks ? ' *' : '*');
        });
        this.overwrite(end - BLOCK_COMMENT_DELIMITER.length, end, isMultiline && lineUpAsterisks ? ' */' : '*/');
    };
    /**
     * Patches a single-line comment.
     *
     * @private
     */
    ProgramPatcher.prototype.patchLineComment = function (comment) {
        var start = comment.start;
        this.overwrite(start, start + '#'.length, '//');
    };
    /**
     * Patches a shebang comment.
     *
     * @private
     */
    ProgramPatcher.prototype.patchShebangComment = function (comment) {
        var start = comment.start, end = comment.end;
        var commentBody = this.slice(start, end);
        var coffeeIndex = commentBody.indexOf('coffee');
        if (coffeeIndex >= 0) {
            this.overwrite(start + coffeeIndex, start + coffeeIndex + 'coffee'.length, 'node');
        }
    };
    /**
     * Serve as the implicit return patcher for anyone not included in a function.
     */
    ProgramPatcher.prototype.canHandleImplicitReturn = function () {
        return true;
    };
    return ProgramPatcher;
}(SharedProgramPatcher_1.default));
exports.default = ProgramPatcher;
