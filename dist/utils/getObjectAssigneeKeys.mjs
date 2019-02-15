import * as tslib_1 from "tslib";
/**
 * Determine the keys explicitly removed from this object assignment, so that we know which keys to
 * omit when processing a rest operation.
 */
import AssignOpPatcher from '../stages/main/patchers/AssignOpPatcher';
import IdentifierPatcher from '../stages/main/patchers/IdentifierPatcher';
import ObjectInitialiserMemberPatcher from '../stages/main/patchers/ObjectInitialiserMemberPatcher';
export default function getObjectAssigneeKeys(node) {
    var e_1, _a;
    var results = [];
    try {
        for (var _b = tslib_1.__values(node.members), _c = _b.next(); !_c.done; _c = _b.next()) {
            var member = _c.value;
            // We ignore non-identifier keys, since CoffeeScript doesn't seem to handle them properly.
            if (member instanceof ObjectInitialiserMemberPatcher && member.key instanceof IdentifierPatcher) {
                results.push(member.key.node.data);
            }
            else if (member instanceof AssignOpPatcher && member.assignee instanceof IdentifierPatcher) {
                results.push(member.assignee.node.data);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return results;
}
