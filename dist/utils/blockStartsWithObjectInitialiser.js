"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nodes_1 = require("decaffeinate-parser/dist/nodes");
var BlockPatcher_1 = require("../stages/main/patchers/BlockPatcher");
var containsDescendant_1 = require("./containsDescendant");
/**
 * Determine if this is a block has an object initializer as its leftmost node.
 * That means that in its JS form, the expression will start with a `{`
 * character and need to be wrapped in parens when used in a JS arrow function.
 */
function blockStartsWithObjectInitialiser(patcher) {
    if (!(patcher instanceof BlockPatcher_1.default) || patcher.statements.length !== 1) {
        return false;
    }
    var statement = patcher.statements[0];
    return containsDescendant_1.default(statement.node, function (child) { return child instanceof nodes_1.ObjectInitialiser && child.start === statement.contentStart; });
}
exports.default = blockStartsWithObjectInitialiser;
