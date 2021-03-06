import { UnaryExistsOp } from 'decaffeinate-parser/dist/nodes';
import { PatchOptions } from '../../../patchers/types';
import UnaryOpPatcher from './UnaryOpPatcher';
/**
 * Handles unary exists, e.g. `a?`.
 */
export default class UnaryExistsOpPatcher extends UnaryOpPatcher {
    node: UnaryExistsOp;
    negated: boolean;
    /**
     * The expression version of this sometimes needs parentheses, but we don't
     * yet have a good mechanism for determining when that is, so we just make
     * sure they're always there. For example, this doesn't need parentheses:
     *
     *   set = a?
     *
     * Because it becomes this:
     *
     *   var set = typeof a !== 'undefined' && a !== null;
     *
     * But this does:
     *
     *   'set? ' + a?
     *
     * Because this:
     *
     *   'set? ' + a != null;
     *
     * Is equivalent to this:
     *
     *   ('set? + a) != null;
     *
     * Which has a different meaning than this:
     *
     *   'set? ' + (a != null);
     */
    patchAsExpression({ needsParens }?: PatchOptions): void;
    /**
     * EXPRESSION '?'
     */
    patchAsStatement(): void;
    /**
     * Since we turn into an equality check, we can simply invert the operator
     * to handle negation internally rather than by prefixing with `!`.
     */
    canHandleNegationInternally(): boolean;
    /**
     * Flips negated flag but doesn't edit anything immediately so that we can
     * use the correct operator in `patch`.
     */
    negate(): void;
    /**
     * @private
     */
    needsTypeofCheck(): boolean;
    /**
     * When we prefix with a `typeof` check we don't need parens, otherwise
     * delegate.
     */
    statementNeedsParens(): boolean;
}
