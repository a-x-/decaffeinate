import { PatchOptions } from '../../../patchers/types';
import ManuallyBoundFunctionPatcher from './ManuallyBoundFunctionPatcher';
export default class BoundGeneratorFunctionPatcher extends ManuallyBoundFunctionPatcher {
    patchFunctionStart({ method }?: PatchOptions): void;
}
