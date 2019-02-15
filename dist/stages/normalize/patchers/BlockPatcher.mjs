import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import getStartOfLine from '../../../utils/getStartOfLine';
import SharedBlockPatcher from './../../../patchers/SharedBlockPatcher';
var BlockPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(BlockPatcher, _super);
    function BlockPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BlockPatcher.prototype.patchAsExpression = function () {
        this.patchAsStatement();
    };
    BlockPatcher.prototype.patchAsStatement = function () {
        var e_1, _a, e_2, _b;
        if (this.node.inline) {
            try {
                for (var _c = tslib_1.__values(this.statements), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var statement = _d.value;
                    statement.patch();
                    this.normalizeAfterStatement(statement);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return;
        }
        // Having inconsistent indentation within a block is allowed in some cases
        // when there are implicit function calls, but when function call parens are
        // added, the inconsistent indentation can make the CoffeeScript invalid. So
        // we need to correct any inconsistent indentation in the normalize step so
        // that the result CoffeeScript will always be valid.
        var blockIndentLength = null;
        try {
            for (var _e = tslib_1.__values(this.statements), _f = _e.next(); !_f.done; _f = _e.next()) {
                var statement = _f.value;
                var indentLength = this.getIndentLength(statement);
                if (indentLength !== null) {
                    if (blockIndentLength === null) {
                        blockIndentLength = indentLength;
                    }
                    else {
                        var charsToRemove = indentLength - blockIndentLength;
                        if (charsToRemove < 0) {
                            throw this.error('Unexpected statement at an earlier indentation level than an ' + 'earlier statement in the block.');
                        }
                        if (charsToRemove > 0) {
                            this.removePrecedingSpaceChars(statement.outerStart, charsToRemove);
                        }
                    }
                }
                statement.patch();
                this.normalizeAfterStatement(statement);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    /**
     * Get rid of some number of spaces of indentation before this point in the
     * code. We need to be careful to only remove ranges that have not had any
     * inserts yet, since otherwise we might remove other code in addition to the
     * whitespace, or we might remove too much whitespace.
     */
    BlockPatcher.prototype.removePrecedingSpaceChars = function (index, numToRemove) {
        var numRemaining = numToRemove;
        for (var i = index; numRemaining > 0 && i > 0; i--) {
            var contents = this.slice(i - 1, i);
            if (contents.includes('\n')) {
                throw this.error('Found start of line before removing enough indentation.');
            }
            if (contents === ' ' || contents === '\t') {
                this.remove(i - 1, i);
                numRemaining -= 1;
            }
        }
    };
    /**
     * If this statement starts immediately after its line's initial indentation,
     * return the length of that indentation. Otherwise, return null.
     */
    BlockPatcher.prototype.getIndentLength = function (statement) {
        var startOfLine = getStartOfLine(this.context.source, statement.outerStart);
        var indentText = this.context.source.slice(startOfLine, statement.outerStart);
        if (/^[ \t]*$/.test(indentText)) {
            return indentText.length;
        }
        else {
            return null;
        }
    };
    /**
     * Statements can be comma-separated within classes, which is equivalent to
     * semicolons, so just change them to semicolons.
     */
    BlockPatcher.prototype.normalizeAfterStatement = function (statement) {
        var followingComma = statement.nextSemanticToken();
        if (!followingComma || followingComma.type !== SourceType.COMMA || followingComma.start >= this.contentEnd) {
            return;
        }
        this.overwrite(followingComma.start, followingComma.end, ';');
    };
    return BlockPatcher;
}(SharedBlockPatcher));
export default BlockPatcher;
