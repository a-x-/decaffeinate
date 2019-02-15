"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var coffee_lex_1 = require("coffee-lex");
var nodes_1 = require("decaffeinate-parser/dist/nodes");
var ObjectInitialiserPatcher_1 = require("../stages/normalize/patchers/ObjectInitialiserPatcher");
/**
 * Determine if the given postfix if/while/for needs to have parens wrapped
 * around it while it is reordered. This happens when the expression has a comma
 * after it as part of a list (function args, array initializer, or object
 * initializer). It also happens when there is a semicolon immediately
 * afterward, since without the parens the next statement would be pulled into
 * the block. It also happens when the expression is within a spread node, since
 * otherwise there are precedence issues.
 */
function postfixNodeNeedsOuterParens(patcher) {
    var parent = patcher.parent;
    if (parent) {
        if (parent.node instanceof nodes_1.Spread) {
            return true;
        }
        var grandparent = parent.parent;
        if (grandparent && grandparent instanceof ObjectInitialiserPatcher_1.default && grandparent.isImplicitObjectInitializer()) {
            return true;
        }
    }
    var nextToken = patcher.nextSemanticToken();
    if (nextToken) {
        return nextToken.type === coffee_lex_1.SourceType.COMMA || nextToken.type === coffee_lex_1.SourceType.SEMICOLON;
    }
    return false;
}
exports.default = postfixNodeNeedsOuterParens;
