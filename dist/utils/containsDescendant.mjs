import { traverse } from 'decaffeinate-parser';
export default function containsDescendant(node, predicate, _a) {
    var _b = (_a === void 0 ? {} : _a).shouldStopTraversal, shouldStopTraversal = _b === void 0 ? function () { return false; } : _b;
    var found = false;
    traverse(node, function (childNode) {
        if (found) {
            return false;
        }
        if (predicate(childNode)) {
            found = true;
            return false;
        }
        if (shouldStopTraversal(childNode)) {
            return false;
        }
        return true;
    });
    return found;
}
