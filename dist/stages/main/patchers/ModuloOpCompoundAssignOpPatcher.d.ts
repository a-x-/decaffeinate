import { PatchOptions } from '../../../patchers/types';
import CompoundAssignOpPatcher from './CompoundAssignOpPatcher';
export default class ModuloOpCompoundAssignOpPatcher extends CompoundAssignOpPatcher {
    patchAsExpression({ needsParens }?: PatchOptions): void;
    patchAsStatement(): void;
}
