"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nodes_1 = require("decaffeinate-parser/dist/nodes");
var flatMap_1 = require("./flatMap");
/**
 * Gets the identifiers for the given LHS value.
 *
 * @example
 *
 *   Given `a`, returns [`a`].
 *   Given `[a, b]`, returns [`a`, `b`].
 *   Given `{a, b: c}`, returns [`a`, `c`].
 *   Given `[a, {b, c: d}]`, returns [`a`, `b`, `d`].
 */
function leftHandIdentifiers(node) {
    if (node instanceof nodes_1.Identifier) {
        return [node];
    }
    else if (node instanceof nodes_1.ArrayInitialiser) {
        return flatMap_1.default(node.members, leftHandIdentifiers);
    }
    else if (node instanceof nodes_1.ObjectInitialiser) {
        return flatMap_1.default(node.members, function (member) {
            if (member instanceof nodes_1.ObjectInitialiserMember) {
                return leftHandIdentifiers(member.expression || member.key);
            }
            else if (member instanceof nodes_1.Spread) {
                return leftHandIdentifiers(member.expression);
            }
            {
                return leftHandIdentifiers(member.assignee);
            }
        });
    }
    else {
        return [];
    }
}
exports.default = leftHandIdentifiers;
