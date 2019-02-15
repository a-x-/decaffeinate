import { Identifier } from 'decaffeinate-parser/dist/nodes';
import containsDescendant from './containsDescendant';
import { isFunction } from './types';
export default function referencesArguments(node) {
    return containsDescendant(node, function (child) { return child instanceof Identifier && child.data === 'arguments'; }, {
        shouldStopTraversal: function (child) { return child !== node && isFunction(child); }
    });
}
