"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AssignOpPatcher_1 = require("../stages/main/patchers/AssignOpPatcher");
var ConditionalPatcher_1 = require("../stages/main/patchers/ConditionalPatcher");
var DynamicMemberAccessOpPatcher_1 = require("../stages/main/patchers/DynamicMemberAccessOpPatcher");
var FunctionApplicationPatcher_1 = require("../stages/main/patchers/FunctionApplicationPatcher");
var InOpPatcher_1 = require("../stages/main/patchers/InOpPatcher");
var SoakedDynamicMemberAccessOpPatcher_1 = require("../stages/main/patchers/SoakedDynamicMemberAccessOpPatcher");
var SoakedFunctionApplicationPatcher_1 = require("../stages/main/patchers/SoakedFunctionApplicationPatcher");
var SoakedMemberAccessOpPatcher_1 = require("../stages/main/patchers/SoakedMemberAccessOpPatcher");
var WhilePatcher_1 = require("../stages/main/patchers/WhilePatcher");
/**
 * Given a main stage patcher, determine from the AST if it needs to be wrapped
 * in parens when transformed into a JS ternary.
 *
 * Be defensive by listing all known common cases where this is correct, and
 * requiring parens in all other cases. That way, any missed cases result in
 * slightly ugly code rather than incorrect code.
 */
function ternaryNeedsParens(patcher) {
    if (patcher.hadUnparenthesizedNegation()) {
        return true;
    }
    var parent = patcher.parent;
    return !(patcher.isSurroundedByParentheses() ||
        (parent instanceof FunctionApplicationPatcher_1.default && patcher !== parent.fn) ||
        (parent instanceof DynamicMemberAccessOpPatcher_1.default && patcher === parent.indexingExpr) ||
        (parent instanceof ConditionalPatcher_1.default &&
            !parent.node.isUnless &&
            patcher === parent.condition &&
            !parent.willPatchAsTernary()) ||
        (parent instanceof WhilePatcher_1.default && !parent.node.isUntil && patcher === parent.condition) ||
        parent instanceof InOpPatcher_1.default ||
        (parent instanceof AssignOpPatcher_1.default && patcher === parent.expression) ||
        // This function is called for soak operations, so outer soak operations
        // will insert a __guard__ helper and thus won't need additional parens.
        (parent instanceof SoakedMemberAccessOpPatcher_1.default && patcher === parent.expression) ||
        (parent instanceof SoakedDynamicMemberAccessOpPatcher_1.default && patcher === parent.expression) ||
        (parent instanceof SoakedFunctionApplicationPatcher_1.default && patcher === parent.fn));
}
exports.default = ternaryNeedsParens;
