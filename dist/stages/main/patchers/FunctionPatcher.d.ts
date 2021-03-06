import SourceToken from 'coffee-lex/dist/SourceToken';
import { PatcherContext, PatchOptions } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
import BlockPatcher from './BlockPatcher';
export default class FunctionPatcher extends NodePatcher {
    parameters: Array<NodePatcher>;
    body: BlockPatcher | null;
    _implicitReturnsDisabled: boolean;
    constructor(patcherContext: PatcherContext, parameters: Array<NodePatcher>, body: BlockPatcher | null);
    initialize(): void;
    patchAsExpression({ method }?: PatchOptions): void;
    patchFunctionStart({ method }: {
        method: boolean;
    }): void;
    patchFunctionBody(): void;
    isEndOfFunctionCall(): boolean;
    /**
     * If we're the last argument to a function, place the } just before the
     * close-paren. There will always be a close-paren because all implicit
     * parentheses were added in the normalize stage.
     *
     * However, if the close-paren is at the end of our line, it usually looks
     * better to put the }) on the next line instead.
     */
    placeCloseBraceBeforeFunctionCallEnd(): void;
    getArrowToken(): SourceToken;
    expectedArrowType(): string;
    hasParamStart(): boolean;
    canHandleImplicitReturn(): boolean;
    setExplicitlyReturns(): void;
    /**
     * Call before initialization to prevent this function from implicitly
     * returning its last statement.
     */
    disableImplicitReturns(): void;
    /**
     * Determines whether this function has implicit returns disabled.
     */
    implicitReturnsDisabled(): boolean;
    /**
     * Functions in CoffeeScript are always anonymous and therefore need parens.
     */
    statementNeedsParens(): boolean;
}
