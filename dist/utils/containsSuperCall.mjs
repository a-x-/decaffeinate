import { BareSuperFunctionApplication, Class, Super } from 'decaffeinate-parser/dist/nodes';
import containsDescendant from './containsDescendant';
export default function containsSuperCall(node) {
    return containsDescendant(node, function (child) { return child instanceof Super || child instanceof BareSuperFunctionApplication; }, {
        shouldStopTraversal: function (child) { return child instanceof Class; }
    });
}
