"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Determine the keys explicitly removed from this object assignment, so that we know which keys to
 * omit when processing a rest operation.
 */
var AssignOpPatcher_1 = require("../stages/main/patchers/AssignOpPatcher");
var IdentifierPatcher_1 = require("../stages/main/patchers/IdentifierPatcher");
var ObjectInitialiserMemberPatcher_1 = require("../stages/main/patchers/ObjectInitialiserMemberPatcher");
function getObjectAssigneeKeys(node) {
    var e_1, _a;
    var results = [];
    try {
        for (var _b = tslib_1.__values(node.members), _c = _b.next(); !_c.done; _c = _b.next()) {
            var member = _c.value;
            // We ignore non-identifier keys, since CoffeeScript doesn't seem to handle them properly.
            if (member instanceof ObjectInitialiserMemberPatcher_1.default && member.key instanceof IdentifierPatcher_1.default) {
                results.push(member.key.node.data);
            }
            else if (member instanceof AssignOpPatcher_1.default && member.assignee instanceof IdentifierPatcher_1.default) {
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
exports.default = getObjectAssigneeKeys;
