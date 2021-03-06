import { PatchOptions } from '../../../patchers/types';
import YieldPatcher from './YieldPatcher';
export default class YieldFromPatcher extends YieldPatcher {
    /**
     * 'yield' 'from' EXPRESSION
     */
    patchAsExpression({ needsParens }?: PatchOptions): void;
}
