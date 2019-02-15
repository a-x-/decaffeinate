import NodePatcher from '../../../patchers/NodePatcher';
import { PatcherContext } from '../../../patchers/types';
import IdentifierPatcher from './IdentifierPatcher';
import ModuleSpecifierPatcher from './ModuleSpecifierPatcher';
import StringPatcher from './StringPatcher';
export default class ImportDeclarationPatcher extends NodePatcher {
    defaultBinding: IdentifierPatcher | null;
    namespaceImport: IdentifierPatcher | null;
    namedImports: Array<ModuleSpecifierPatcher> | null;
    source: StringPatcher;
    constructor(patcherContext: PatcherContext, defaultBinding: IdentifierPatcher | null, namespaceImport: IdentifierPatcher | null, namedImports: Array<ModuleSpecifierPatcher> | null, source: StringPatcher);
    patchAsStatement(): void;
}
