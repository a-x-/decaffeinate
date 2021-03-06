import SourceToken from 'coffee-lex/dist/SourceToken';
import { PatcherContext, PatchOptions } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
export default class BinaryOpPatcher extends NodePatcher {
    left: NodePatcher;
    right: NodePatcher;
    binaryOpNegated: boolean;
    constructor(patcherContext: PatcherContext, left: NodePatcher, right: NodePatcher);
    initialize(): void;
    /**
     * Subclasses can override to avoid setting the RHS as an expression by default.
     */
    rhsMayBeStatement(): boolean;
    negate(): void;
    isPure(): boolean;
    /**
     * LEFT OP RIGHT
     */
    patchAsExpression({ needsParens }?: PatchOptions): void;
    patchOperator(): void;
    getOperator(): string;
    getOperatorToken(): SourceToken;
    /**
     * Subclasses may override this to provide a custom token predicate.
     */
    operatorTokenPredicate(): (token: SourceToken) => boolean;
    /**
     * IF `LEFT` needs parens then `LEFT + RIGHT` needs parens.
     */
    statementNeedsParens(): boolean;
}
