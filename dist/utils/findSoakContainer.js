"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AssignOpPatcher_1 = require("../stages/main/patchers/AssignOpPatcher");
var DynamicMemberAccessOpPatcher_1 = require("../stages/main/patchers/DynamicMemberAccessOpPatcher");
var FunctionApplicationPatcher_1 = require("../stages/main/patchers/FunctionApplicationPatcher");
var MemberAccessOpPatcher_1 = require("../stages/main/patchers/MemberAccessOpPatcher");
var SoakedDynamicMemberAccessOpPatcher_1 = require("../stages/main/patchers/SoakedDynamicMemberAccessOpPatcher");
var SoakedFunctionApplicationPatcher_1 = require("../stages/main/patchers/SoakedFunctionApplicationPatcher");
var SoakedMemberAccessOpPatcher_1 = require("../stages/main/patchers/SoakedMemberAccessOpPatcher");
var notNull_1 = require("./notNull");
/**
 * Find the enclosing node defining the "soak range" for a given soak operation.
 * For example, in the expression `a(b?.c.d())`, returns the `b?.c.d()` node,
 * since that's the chain of operations that will be skipped if `b` is null or
 * undefined.
 */
function findSoakContainer(patcher) {
    var result = patcher;
    while (canParentHandleSoak(result)) {
        result = notNull_1.default(result.parent);
    }
    return result;
}
exports.default = findSoakContainer;
/**
 * Determine if this "soak range" can be expanded outward.
 *
 * In determining the soak range, we also stop when we see other soak
 * operations. For example, in `a?.b?.c`, `a?.b` is used as the soak container
 * for the first soak, which works because the second soak operation will
 * "take over"; if `a` is null or undefined, then `a?.b` will be undefined, so
 * the entire thing will evaluate to undefined. This requires all soak
 * operations to do a null check on their leftmost value, which is why we need
 * to make __guardMethod__ do a null check on the object arg.
 */
function canParentHandleSoak(patcher) {
    if (patcher.parent === null) {
        return false;
    }
    if (patcher.isSurroundedByParentheses()) {
        return false;
    }
    // If we are currently the `a?.b` in an expression like `a?.b.c?()`, we don't
    // want to expand any further, since method-style soaked function application
    // is a special case and the `.c?(` will be patched. In this case, the `a?.b`
    // is what we should set as our soak container, since the method-style soak
    // implementation will "take over" from that point.
    if ((patcher.parent instanceof MemberAccessOpPatcher_1.default || patcher.parent instanceof DynamicMemberAccessOpPatcher_1.default) &&
        patcher.parent.parent !== null &&
        patcher.parent.parent instanceof SoakedFunctionApplicationPatcher_1.default &&
        patcher.parent.parent.fn === patcher.parent) {
        return false;
    }
    if (patcher.parent instanceof MemberAccessOpPatcher_1.default && !(patcher.parent instanceof SoakedMemberAccessOpPatcher_1.default)) {
        return true;
    }
    if (patcher.parent instanceof DynamicMemberAccessOpPatcher_1.default &&
        !(patcher.parent instanceof SoakedDynamicMemberAccessOpPatcher_1.default) &&
        patcher.parent.expression === patcher) {
        return true;
    }
    if (patcher.parent instanceof FunctionApplicationPatcher_1.default &&
        !(patcher.parent instanceof SoakedFunctionApplicationPatcher_1.default) &&
        patcher.parent.fn === patcher) {
        return true;
    }
    if (patcher.parent instanceof AssignOpPatcher_1.default && patcher.parent.assignee === patcher) {
        return true;
    }
    if (['PostIncrementOp', 'PostDecrementOp', 'PreIncrementOp', 'PreDecrementOp', 'DeleteOp'].indexOf(patcher.parent.node.type) >= 0) {
        return true;
    }
    return false;
}
