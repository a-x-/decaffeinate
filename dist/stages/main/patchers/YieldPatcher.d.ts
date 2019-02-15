import { PatcherContext, PatchOptions } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
export default class YieldPatcher extends NodePatcher {
    expression: NodePatcher | null;
    constructor(patcherContext: PatcherContext, expression: NodePatcher | null);
    initialize(): void;
    /**
     * 'yield' EXPRESSION
     */
    patchAsExpression({ needsParens }?: PatchOptions): void;
    needsParens(): boolean;
}
