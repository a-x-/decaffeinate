import { PatcherContext } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
/**
 * Handles object literals.
 */
export default class ObjectInitialiserPatcher extends NodePatcher {
    members: Array<NodePatcher>;
    constructor(patcherContext: PatcherContext, members: Array<NodePatcher>);
    patchAsExpression(): void;
    isImplicitObjectInitializer(): boolean;
}
