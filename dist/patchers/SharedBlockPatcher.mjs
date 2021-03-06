import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import notNull from '../utils/notNull';
import NodePatcher from './NodePatcher';
var SharedBlockPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(SharedBlockPatcher, _super);
    function SharedBlockPatcher(patcherContext, statements) {
        var _this = _super.call(this, patcherContext) || this;
        _this.shouldPatchInline = null;
        _this.statements = statements;
        return _this;
    }
    /**
     * Insert statements somewhere in this block.
     */
    SharedBlockPatcher.prototype.insertStatementsAtIndex = function (statements, index) {
        var _this = this;
        var separator = this.inline() ? '; ' : ';\n';
        if (index === this.statements.length) {
            var lastStatement = this.statements[this.statements.length - 1];
            var terminatorTokenIndex = this.context.sourceTokens.indexOfTokenMatchingPredicate(function (token) { return token.type === SourceType.NEWLINE || token.type === SourceType.SEMICOLON; }, lastStatement.outerEndTokenIndex);
            var insertionPoint_1 = terminatorTokenIndex
                ? notNull(this.sourceTokenAtIndex(terminatorTokenIndex)).start
                : lastStatement.outerEnd;
            insertionPoint_1 = Math.min(insertionPoint_1, this.getBoundingPatcher().innerEnd);
            var indent_1 = lastStatement.getIndent();
            statements.forEach(function (line) {
                var sep = line.trim().startsWith('//') ? '\n' : separator;
                _this.insert(insertionPoint_1, "" + sep + indent_1 + line);
            });
        }
        else {
            var statementToInsertBefore = this.statements[index];
            var insertionPoint_2 = statementToInsertBefore.outerStart;
            var indent_2 = statementToInsertBefore.getIndent();
            statements.forEach(function (line) {
                var sep = line.trim().startsWith('//') ? '\n' : separator;
                _this.insert(insertionPoint_2, "" + line + sep + indent_2);
            });
        }
    };
    /**
     * Insert a statement before the current block. Since blocks can be patched in
     * a number of ways, this needs to handle a few cases:
     * - If it's completely inline, we don't deal with any indentation and just
     *   put a semicolon-separated statement before the start.
     * - If it's a normal non-inline block, we insert the statement beforehand
     *   with the given indentation. However, `this.outerStart` is the first
     *   non-whitespace character of the first line, so it's already indented, so
     *   if we want to add a line with *less* indentation, it's a lot more tricky.
     *   We handle this by walking backward to the previous newline and inserting
     *   a new line from there. This allows the prepended line to have whatever
     *   indentation level we want.
     * - In some cases, such as nontrivial loop expressions with an inline body,
     *   the source CoffeeScript is inline, but we want the result to be
     *   non-inline, so we need to be a lot more careful. The normal non-inline
     *   strategy won't work because there's no newline to walk back to in the
     *   source CoffeeScript, so the strategy is to instead always insert at
     *   `this.outerStart`. That means that the indentation for the actual body
     *   needs to be done later, just before the body itself is patched. See the
     *   uses of shouldConvertInlineBodyToNonInline in LoopPatcher for an example.
     */
    SharedBlockPatcher.prototype.insertLineBefore = function (statement, indent) {
        if (indent === void 0) { indent = this.getIndent(); }
        if (this.inline()) {
            this.insert(this.outerStart, statement + "; ");
        }
        else if (this.node.inline) {
            this.insert(this.outerStart, "" + indent + statement + ";\n");
        }
        else {
            var insertIndex = this.outerStart;
            while (insertIndex > 0 && this.context.source[insertIndex] !== '\n') {
                insertIndex--;
            }
            this.insert(insertIndex, "\n" + indent + statement + ";");
        }
    };
    SharedBlockPatcher.prototype.insertLineAfter = function (statement, indent) {
        if (this.inline()) {
            this.insert(this.outerEnd, "; " + statement);
        }
        else {
            this.insert(this.outerEnd, "\n" + indent + statement + ";");
        }
    };
    /**
     * Gets whether this patcher's block is inline (on the same line as the node
     * that contains it) or not.
     */
    SharedBlockPatcher.prototype.inline = function () {
        if (this.shouldPatchInline !== null) {
            return this.shouldPatchInline;
        }
        return this.node.inline;
    };
    return SharedBlockPatcher;
}(NodePatcher));
export default SharedBlockPatcher;
