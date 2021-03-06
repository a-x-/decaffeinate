import SourceToken from 'coffee-lex/dist/SourceToken';
import NodePatcher from '../../../patchers/NodePatcher';
import { PatcherContext } from '../../../patchers/types';
export default class SwitchPatcher extends NodePatcher {
    expression: NodePatcher;
    cases: Array<NodePatcher>;
    alternate: NodePatcher | null;
    constructor(patcherContext: PatcherContext, expression: NodePatcher, cases: Array<NodePatcher>, alternate: NodePatcher | null);
    initialize(): void;
    prefersToPatchAsExpression(): boolean;
    patchAsStatement(): void;
    /**
     * If we're a statement, our children can handle implicit return, so no need
     * to convert to an expression.
     */
    implicitlyReturns(): boolean;
    setImplicitlyReturns(): void;
    patchAsExpression(): void;
    willPatchAsIIFE(): boolean;
    canHandleImplicitReturn(): boolean;
    /**
     * @private
     */
    overwriteElse(): void;
    /**
     * @private
     */
    getElseToken(): SourceToken | null;
    /**
     * @private
     */
    getSwitchToken(): SourceToken;
    /**
     * Switch statements with all code paths present have a `default` case and
     * each case has all of its code paths covered.
     */
    allCodePathsPresent(): boolean;
}
