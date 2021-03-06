import { Node } from 'decaffeinate-parser/dist/nodes';
import { PatcherClass } from '../../../patchers/NodePatcher';
import { PatchOptions } from '../../../patchers/types';
import FunctionPatcher from './FunctionPatcher';
/**
 * Handles bound functions, i.e. "fat arrows".
 */
export default class BoundFunctionPatcher extends FunctionPatcher {
    initialize(): void;
    /**
     * Use a slightly-modified version of the regular `FunctionPatcher` when
     * we can't use arrow functions.
     */
    static patcherClassOverrideForNode(node: Node): PatcherClass | null;
    patchAsStatement(options?: PatchOptions): void;
    patchFunctionStart(): void;
    parameterListNeedsParentheses(): boolean;
    patchFunctionBody(): void;
    expectedArrowType(): string;
    willPatchBodyInline(): boolean;
    shouldPatchAsBlocklessArrowFunction(): boolean;
    /**
     * Bound functions already start with a paren or a param identifier, and so
     * are safe to start a statement.
     */
    statementNeedsParens(): boolean;
}
