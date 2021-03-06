import { ChainedComparisonOp } from 'decaffeinate-parser/dist/nodes';
import { PatcherContext, PatchOptions } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
/**
 * Handles constructs of the form `a < b < c < … < z`.
 */
export default class ChainedComparisonOpPatcher extends NodePatcher {
    node: ChainedComparisonOp;
    operands: Array<NodePatcher>;
    negated: boolean;
    /**
     * `node` should have type `ChainedComparisonOp`.
     */
    constructor(patcherContext: PatcherContext, operands: Array<NodePatcher>);
    initialize(): void;
    patchAsExpression({ needsParens }?: PatchOptions): void;
    /**
     * If any negation is unsafe, just wrap the whole thing in parens with a !
     * operator. That's easier and arguably nicer-looking than trying to
     * intelligently negate the subexpressions accounting for unsafe negations.
     */
    shouldNegateEntireExpression(): boolean;
    /**
     * @private
     */
    getMiddleOperands(): Array<NodePatcher>;
    negate(): void;
    /**
     * Forward the request to the first operand.
     */
    statementNeedsParens(): boolean;
}
