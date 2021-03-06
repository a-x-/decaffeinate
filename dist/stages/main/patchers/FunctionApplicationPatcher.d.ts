import { PatcherContext, PatchOptions } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
export default class FunctionApplicationPatcher extends NodePatcher {
    fn: NodePatcher;
    args: Array<NodePatcher>;
    constructor(patcherContext: PatcherContext, fn: NodePatcher, args: Array<NodePatcher>);
    initialize(): void;
    /**
     * Note that we don't need to worry about implicit function applications,
     * since the normalize stage would have already added parens.
     */
    patchAsExpression({ fnNeedsParens }?: PatchOptions): void;
    /**
     * Probably can't happen, but just for completeness.
     */
    statementNeedsParens(): boolean;
}
