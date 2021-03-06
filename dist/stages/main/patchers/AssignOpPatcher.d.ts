import { PatcherContext } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
export default class AssignOpPatcher extends NodePatcher {
    assignee: NodePatcher;
    expression: NodePatcher;
    negated: boolean;
    constructor(patcherContext: PatcherContext, assignee: NodePatcher, expression: NodePatcher);
    initialize(): void;
    negate(): void;
    patchAsExpression(): void;
    patchAsStatement(): void;
    private patchAsObjectDestructureWithDefault;
    willResultInSeqExpression(): boolean;
    patchSimpleAssignment(): void;
    overwriteWithAssignments(assignments: Array<string>): void;
    /**
     * Recursively walk a CoffeeScript assignee to generate a sequence of
     * JavaScript assignments.
     *
     * patcher is a patcher for the assignee.
     * ref is a code snippet, not necessarily repeatable, that can be used to
     *   reference the value being assigned.
     * refIsRepeatable says whether ref may be used more than once. If not, we
     *   sometimes generate an extra assignment to make it repeatable.
     */
    generateAssignments(patcher: NodePatcher, ref: string, refIsRepeatable: boolean): Array<string>;
    accessFieldForObjectDestructure(patcher: NodePatcher): string;
    /**
     * If this is an assignment of the form `A.prototype.b = -> super`, we need to
     * mark the `A` expression, and possibly the indexed value, as repeatable so
     * that the super transform can make use of it.
     */
    markProtoAssignmentRepeatableIfNecessary(): void;
    shouldUseArrayFrom(): boolean;
}
