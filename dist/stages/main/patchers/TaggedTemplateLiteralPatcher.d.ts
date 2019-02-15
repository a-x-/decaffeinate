import NodePatcher from '../../../patchers/NodePatcher';
import { PatcherContext } from '../../../patchers/types';
import StringPatcher from './StringPatcher';
export default class TaggedTemplateLiteralPatcher extends NodePatcher {
    tag: NodePatcher;
    template: StringPatcher;
    constructor(patcherContext: PatcherContext, tag: NodePatcher, template: StringPatcher);
    patchAsExpression(): void;
}
