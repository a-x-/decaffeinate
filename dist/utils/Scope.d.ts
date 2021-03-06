import { Node } from 'decaffeinate-parser/dist/nodes';
/**
 * Represents a CoffeeScript scope and its bindings.
 */
export default class Scope {
    readonly containerNode: Node;
    readonly parent: Scope | null;
    private bindings;
    private modificationsAfterDeclaration;
    private innerClosureModifications;
    constructor(containerNode: Node, parent?: Scope | null);
    getBinding(name: string): Node | null;
    isBindingAvailable(name: string): boolean;
    hasBinding(name: string): boolean;
    hasModificationAfterDeclaration(name: string): boolean;
    hasInnerClosureModification(name: string): boolean;
    getOwnNames(): Array<string>;
    hasOwnBinding(name: string): boolean;
    /**
     * Mark that the given name is explicitly declared, e.g. in a parameter.
     */
    declares(name: string, node: Node): void;
    /**
     * Mark that the given name is part of an assignment. This might introduce a
     * new variable or might set an existing variable, depending on context.
     */
    assigns(name: string, node: Node): void;
    /**
     * Mark that the given name is part of a modification, e.g. `+=` or `++`.
     */
    modifies(name: string): void;
    claimFreeBinding(node: Node, name?: string | Array<string> | null): string;
    /**
     * @private
     */
    key(name: string): string;
    /**
     * @private
     */
    unkey(key: string): string;
    /**
     * Handles declarations or assigns for any bindings for a given node.
     */
    processNode(node: Node): void;
    toString(): string;
    inspect(): string;
}
