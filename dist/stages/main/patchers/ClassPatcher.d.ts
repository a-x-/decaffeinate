import SourceToken from 'coffee-lex/dist/SourceToken';
import { Node } from 'decaffeinate-parser/dist/nodes';
import { PatcherContext, PatchOptions } from '../../../patchers/types';
import NodePatcher, { PatcherClass } from './../../../patchers/NodePatcher';
import ClassBlockPatcher from './ClassBlockPatcher';
export default class ClassPatcher extends NodePatcher {
    nameAssignee: NodePatcher | null;
    superclass: NodePatcher | null;
    body: ClassBlockPatcher | null;
    constructor(patcherContext: PatcherContext, nameAssignee: NodePatcher | null, parent: NodePatcher | null, body: ClassBlockPatcher | null);
    static patcherClassForChildNode(_node: Node, property: string): PatcherClass | null;
    initialize(): void;
    patchAsStatement(): void;
    patchAsExpression({ skipParens }?: PatchOptions): void;
    statementNeedsSemicolon(): boolean;
    /**
     * Classes, like functions, only need parens as statements when anonymous.
     */
    statementNeedsParens(): boolean;
    /**
     * @private
     */
    getClassToken(): SourceToken;
    /**
     * @private
     */
    isAnonymous(): boolean;
    /**
     * @private
     */
    isNamespaced(): boolean;
    /**
     * Determine if the name of this class already has a declaration earlier. If
     * so, we want to emit an assignment-style class instead of a class
     * declaration.
     */
    isNameAlreadyDeclared(): boolean;
    /**
     * @private
     */
    getName(): string | null;
    isSubclass(): boolean;
    /**
     * @private
     */
    getBraceInsertionOffset(): number;
}
