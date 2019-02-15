import NodePatcher from '../../../patchers/NodePatcher';
import { PatcherContext } from '../../../patchers/types';
import ModuleSpecifierPatcher from './ModuleSpecifierPatcher';
import StringPatcher from './StringPatcher';
export default class ExportBindingsDeclarationPatcher extends NodePatcher {
    namedExports: Array<ModuleSpecifierPatcher>;
    source: StringPatcher | null;
    constructor(patcherContext: PatcherContext, namedExports: Array<ModuleSpecifierPatcher>, source: StringPatcher | null);
    patchAsStatement(): void;
}
