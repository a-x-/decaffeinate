import { PatcherContext } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
import AssignOpPatcher from './AssignOpPatcher';
import ObjectInitialiserMemberPatcher from './ObjectInitialiserMemberPatcher';
import SpreadPatcher from './SpreadPatcher';
export declare type OpenCurlyInfo = {
    curlyBraceInsertionPosition: number;
    textToInsert: string;
    shouldIndent: boolean;
};
/**
 * Handles object literals.
 */
export default class ObjectInitialiserPatcher extends NodePatcher {
    members: Array<ObjectInitialiserMemberPatcher | AssignOpPatcher | SpreadPatcher>;
    constructor(patcherContext: PatcherContext, members: Array<ObjectInitialiserMemberPatcher | AssignOpPatcher>);
    initialize(): void;
    setAssignee(): void;
    setExpression(force: boolean): boolean;
    /**
     * Objects as expressions are very similar to their CoffeeScript equivalents.
     */
    patchAsExpression(): void;
    getOpenCurlyInfo(): OpenCurlyInfo;
    /**
     * Objects as statements need to be wrapped in parentheses, or else they'll be
     * confused with blocks. That is, this is not an object [1]:
     *
     *   { a: 0 };
     *
     * But this is fine:
     *
     *   ({ a: 0 });
     *
     * [1]: It is actually valid code, though. It's a block with a labeled
     * statement `a` with a single expression statement, being the literal 0.
     */
    patchAsStatement(): void;
    /**
     * @private
     */
    shouldExpandCurlyBraces(): boolean;
    /**
     * @private
     */
    patchMembers(): void;
    /**
     * Determines whether this object is implicit, i.e. it lacks braces.
     *
     *   a: b      # true
     *   { a: b }  # false
     */
    isImplicitObject(): boolean;
    /**
     * Starting a statement with an object always requires parens.
     */
    statementNeedsParens(): boolean;
}
