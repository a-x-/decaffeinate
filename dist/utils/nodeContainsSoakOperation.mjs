import { SoakedDynamicMemberAccessOp, SoakedFunctionApplication, SoakedMemberAccessOp } from 'decaffeinate-parser/dist/nodes';
import containsDescendant from './containsDescendant';
/**
 * Determine if there are any soak operations within this subtree of the AST.
 */
export default function nodeContainsSoakOperation(node) {
    return containsDescendant(node, function (child) {
        return child instanceof SoakedDynamicMemberAccessOp ||
            child instanceof SoakedFunctionApplication ||
            child instanceof SoakedMemberAccessOp;
    });
}
