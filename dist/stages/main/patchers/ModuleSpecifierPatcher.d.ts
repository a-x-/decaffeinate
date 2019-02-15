import NodePatcher from '../../../patchers/NodePatcher';
import { PatcherContext } from '../../../patchers/types';
import IdentifierPatcher from './IdentifierPatcher';
export default class ModuleSpecifierPatcher extends NodePatcher {
    original: IdentifierPatcher;
    alias: IdentifierPatcher | null;
    constructor(patcherContext: PatcherContext, original: IdentifierPatcher, alias: IdentifierPatcher | null);
    patchAsStatement(): void;
}
