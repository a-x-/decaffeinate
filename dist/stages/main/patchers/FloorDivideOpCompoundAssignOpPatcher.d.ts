import { PatchOptions } from '../../../patchers/types';
import CompoundAssignOpPatcher from './CompoundAssignOpPatcher';
export default class FloorDivideOpCompoundAssignOpPatcher extends CompoundAssignOpPatcher {
    patchAsExpression({ needsParens }?: PatchOptions): void;
    patchAsStatement(): void;
}
