import NodePatcher from '../../../patchers/NodePatcher';
import SharedBlockPatcher from './../../../patchers/SharedBlockPatcher';
export default class BlockPatcher extends SharedBlockPatcher {
    patchAsExpression(): void;
    patchAsStatement(): void;
    /**
     * Get rid of some number of spaces of indentation before this point in the
     * code. We need to be careful to only remove ranges that have not had any
     * inserts yet, since otherwise we might remove other code in addition to the
     * whitespace, or we might remove too much whitespace.
     */
    removePrecedingSpaceChars(index: number, numToRemove: number): void;
    /**
     * If this statement starts immediately after its line's initial indentation,
     * return the length of that indentation. Otherwise, return null.
     */
    getIndentLength(statement: NodePatcher): number | null;
    /**
     * Statements can be comma-separated within classes, which is equivalent to
     * semicolons, so just change them to semicolons.
     */
    normalizeAfterStatement(statement: NodePatcher): void;
}
