import SourceToken from 'coffee-lex/dist/SourceToken';
import { PatcherContext } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
import BlockPatcher from './BlockPatcher';
import LoopPatcher from './LoopPatcher';
export default abstract class ForPatcher extends LoopPatcher {
    keyAssignee: NodePatcher | null;
    valAssignee: NodePatcher | null;
    target: NodePatcher;
    filter: NodePatcher | null;
    _filterCode: string | null;
    _targetCode: string | null;
    _indexBinding: string | null;
    _targetReference: string | null;
    constructor(patcherContext: PatcherContext, keyAssignee: NodePatcher | null, valAssignee: NodePatcher | null, target: NodePatcher, filter: NodePatcher | null, body: BlockPatcher);
    initialize(): void;
    /**
     * Called by the BlockPatcher for the enclosing scope to know which
     * assignments may need declarations at the start of the block.
     */
    getIIFEAssignments(): Array<string>;
    getFilterCode(): string | null;
    getLoopBodyIndent(): string;
    patchBodyAndFilter(): void;
    getRelationToken(): SourceToken;
    /**
     * @protected
     */
    getIndexBinding(): string;
    /**
     * @protected
     */
    computeIndexBinding(): string;
    isThisAssignIndexBinding(): boolean;
    /**
     * @protected
     */
    indexBindingCandidates(): Array<string>;
    /**
     * @protected
     */
    removeThenToken(): void;
    /**
     * Get the last known index of the loop header, just before the `then` token
     * or the body. This can be overridden to account for additional loop header
     * elements.
     */
    getLoopHeaderEnd(): number;
    getTargetCode(): string;
    getTargetReference(): string;
    computeTargetCodeIfNecessary(): void;
    abstract requiresExtractingTarget(): boolean;
    abstract targetBindingCandidate(): string;
}
