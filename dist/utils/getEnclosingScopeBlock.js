"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BlockPatcher_1 = require("../stages/main/patchers/BlockPatcher");
var notNull_1 = require("./notNull");
/**
 * For main stage nodes, find the block corresponding to this node's scope.
 */
function getEnclosingScopeBlock(patcher) {
    var currentPatcher = patcher;
    while (currentPatcher) {
        if (currentPatcher instanceof BlockPatcher_1.default &&
            notNull_1.default(currentPatcher.parent).node === patcher.getScope().containerNode) {
            return currentPatcher;
        }
        currentPatcher = currentPatcher.parent;
    }
    throw patcher.error('Expected to find enclosing scope block.');
}
exports.default = getEnclosingScopeBlock;
