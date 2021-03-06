import { PatchOptions } from '../../../patchers/types';
import CompoundAssignOpPatcher from './CompoundAssignOpPatcher';
export default class ExistsOpCompoundAssignOpPatcher extends CompoundAssignOpPatcher {
    patchAsExpression({ needsParens }?: PatchOptions): void;
    patchAsStatement(): void;
    /**
     * Determine if we need to do `typeof a !== undefined && a !== null` rather
     * than just `a != null`. We need to emit the more defensive version if the
     * variable might not be declared.
     */
    needsTypeofCheck(): boolean;
    /**
     * We'll always start with an `if` so we don't need parens.
     */
    statementNeedsParens(): boolean;
}
