import SourceToken from 'coffee-lex/dist/SourceToken';
import SourceTokenListIndex from 'coffee-lex/dist/SourceTokenListIndex';
import NodePatcher from '../../../patchers/NodePatcher';
import { PatcherContext } from '../../../patchers/types';
import BlockPatcher from './BlockPatcher';
/**
 * Handles `try` statements, e.g. `try a catch e then console.log(e)`.
 */
export default class TryPatcher extends NodePatcher {
    body: BlockPatcher | null;
    catchAssignee: NodePatcher | null;
    catchBody: BlockPatcher | null;
    finallyBody: BlockPatcher | null;
    _errorBinding: string | null;
    constructor(patcherContext: PatcherContext, body: BlockPatcher | null, catchAssignee: NodePatcher | null, catchBody: BlockPatcher | null, finallyBody: BlockPatcher | null);
    initialize(): void;
    canPatchAsExpression(): boolean;
    /**
     * 'try' BODY ( 'catch' ASSIGNEE? CATCH-BODY? )? ( 'finally' FINALLY-BODY )?
     */
    patchAsStatement(): void;
    patchAsExpression(): void;
    willPatchAsIIFE(): boolean;
    canHandleImplicitReturn(): boolean;
    /**
     * If we're a statement, our children can handle implicit return, so no need
     * to convert to an expression.
     */
    implicitlyReturns(): boolean;
    setImplicitlyReturns(): void;
    statementNeedsSemicolon(): boolean;
    /**
     * @private
     */
    getTryToken(): SourceToken;
    /**
     * @private
     */
    getCatchToken(): SourceToken | null;
    /**
     * @private
     */
    getThenTokenIndex(): SourceTokenListIndex | null;
    /**
     * @private
     */
    getFinallyToken(): SourceToken | null;
    /**
     * @private
     */
    getErrorBinding(): string;
}
