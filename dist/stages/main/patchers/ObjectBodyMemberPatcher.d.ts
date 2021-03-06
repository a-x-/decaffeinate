import { PatcherContext } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
/**
 * Handles object properties.
 */
export default abstract class ObjectBodyMemberPatcher extends NodePatcher {
    key: NodePatcher;
    expression: NodePatcher | null;
    constructor(patcherContext: PatcherContext, key: NodePatcher, expression: NodePatcher);
    initialize(): void;
    /**
     * KEY : EXPRESSION
     */
    patchAsExpression(): void;
    patchAsMethod(): void;
    patchAsProperty(): void;
    patchKey(): void;
    /**
     * As a special case, transform {"#{a.b}": c} to {[a.b]: c}, since a template
     * literal is the best way to do computed keys in CoffeeScript. This method
     * gets the patcher for that computed key node, if any.
     */
    getComputedKeyPatcher(): NodePatcher | null;
    patchExpression(): void;
    /**
     * In normal object bodies, we can use method syntax for normal arrow
     * functions and for normal generator functions. If we need to explicitly add
     * `.bind(this)`, then we won't be able to use the method form. But for
     * classes, since the binding is done in the constructor, we can still use
     * method syntax, so ClassAssignOpPatcher overrides this method for that case.
     * We also allow ClassBoundMethodFunctionPatcher since that only comes up in
     * the class case.
     *
     * @protected
     */
    isMethod(): boolean;
    /**
     * Note that we include BoundGeneratorFunctionPatcher, even though the object
     * case doesn't treat it as a method, since the class case should use a
     * generator method.
     *
     * @protected
     */
    isGeneratorMethod(): boolean;
    isAsyncMethod(): boolean;
}
