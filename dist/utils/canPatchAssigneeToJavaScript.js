"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Determine if the given assignee (array destructure, object destructure, rest,
 * etc.) can be translated to JavaScript directly. If not, we'll need to expand
 * the assignee into repeated assignments.
 *
 * Notably, we cannot patch default values (assignment operations) to JavaScript
 * since CS falls back to the default if the value is undefined or null, while
 * JS falls back to the default if the value only if the value is undefined.
 */
var nodes_1 = require("decaffeinate-parser/dist/nodes");
function canPatchAssigneeToJavaScript(node, options, isTopLevel) {
    if (isTopLevel === void 0) { isTopLevel = true; }
    if (node instanceof nodes_1.Identifier ||
        node instanceof nodes_1.MemberAccessOp ||
        node instanceof nodes_1.SoakedMemberAccessOp ||
        node instanceof nodes_1.ProtoMemberAccessOp ||
        node instanceof nodes_1.DynamicMemberAccessOp ||
        node instanceof nodes_1.SoakedDynamicMemberAccessOp ||
        node instanceof nodes_1.SoakedProtoMemberAccessOp ||
        node instanceof nodes_1.Elision) {
        return true;
    }
    if (node instanceof nodes_1.ArrayInitialiser) {
        // Nested array destructures can't convert cleanly because we need to wrap
        // them in Array.from.
        if (!options.useCS2 && !isTopLevel) {
            return false;
        }
        // Empty destructure operations need to result in zero assignments, and thus
        // not call Array.from at all.
        if (node.members.length === 0) {
            return false;
        }
        return node.members.every(function (member, i) {
            var isInFinalPosition = i === node.members.length - 1;
            if (isInFinalPosition && member instanceof nodes_1.Expansion) {
                return true;
            }
            if (isInFinalPosition &&
                (member instanceof nodes_1.Spread || member instanceof nodes_1.Rest) &&
                !(member.expression instanceof nodes_1.ObjectInitialiser) &&
                canPatchAssigneeToJavaScript(member.expression, options, false)) {
                return true;
            }
            return canPatchAssigneeToJavaScript(member, options, false);
        });
    }
    if (node instanceof nodes_1.ObjectInitialiser) {
        // JS empty destructure crashes if the RHS is undefined or null, so more
        // precisely copy the behavior for empty destructures. CS2 does not have this
        // behavior.
        if (!options.useCS2 && node.members.length === 0) {
            return false;
        }
        return node.members.every(function (member, i) {
            var isInFinalPosition = i === node.members.length - 1;
            if (isInFinalPosition &&
                (member instanceof nodes_1.Spread || member instanceof nodes_1.Rest) &&
                member.expression instanceof nodes_1.Identifier) {
                return true;
            }
            return canPatchAssigneeToJavaScript(member, options, false);
        });
    }
    if (node instanceof nodes_1.ObjectInitialiserMember) {
        return canPatchAssigneeToJavaScript(node.expression || node.key, options, false);
    }
    // Defaults work in CS2, but top-level assignments are never defaults.
    if (options.useCS2 && node instanceof nodes_1.AssignOp && !isTopLevel) {
        return canPatchAssigneeToJavaScript(node.assignee, options, false);
    }
    return false;
}
exports.default = canPatchAssigneeToJavaScript;
