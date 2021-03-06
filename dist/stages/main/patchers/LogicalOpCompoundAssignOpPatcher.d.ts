import { PatchOptions } from '../../../patchers/types';
import CompoundAssignOpPatcher from './CompoundAssignOpPatcher';
export default class LogicalOpCompoundAssignOpPatcher extends CompoundAssignOpPatcher {
    patchAsExpression({ needsParens }?: PatchOptions): void;
    patchAsStatement(options?: PatchOptions): void;
    /**
     * @private
     */
    isOrOp(): boolean;
    /**
     * We always start with an `if` statement, so no parens.
     */
    statementNeedsParens(): boolean;
}
