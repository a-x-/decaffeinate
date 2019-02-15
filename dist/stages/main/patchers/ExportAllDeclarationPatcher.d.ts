import NodePatcher from '../../../patchers/NodePatcher';
import { PatcherContext } from '../../../patchers/types';
import StringPatcher from './StringPatcher';
export default class ExportAllDeclarationPatcher extends NodePatcher {
    source: StringPatcher;
    constructor(patcherContext: PatcherContext, source: StringPatcher);
    patchAsStatement(): void;
}
