"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nodes_1 = require("decaffeinate-parser/dist/nodes");
var containsDescendant_1 = require("./containsDescendant");
var types_1 = require("./types");
function referencesArguments(node) {
    return containsDescendant_1.default(node, function (child) { return child instanceof nodes_1.Identifier && child.data === 'arguments'; }, {
        shouldStopTraversal: function (child) { return child !== node && types_1.isFunction(child); }
    });
}
exports.default = referencesArguments;
