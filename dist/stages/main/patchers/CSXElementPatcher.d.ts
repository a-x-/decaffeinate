import NodePatcher from '../../../patchers/NodePatcher';
import { PatcherContext } from '../../../patchers/types';
export default class CSXElementPatcher extends NodePatcher {
    properties: Array<NodePatcher>;
    children: Array<NodePatcher | null>;
    constructor(patcherContext: PatcherContext, properties: Array<NodePatcher>, children: Array<NodePatcher | null>);
    initialize(): void;
    patchAsExpression(): void;
    /**
     * Patch a property that is definitely a string and may or may not already be surrounded by braces.
     */
    patchStringProperty(property: NodePatcher): void;
}
