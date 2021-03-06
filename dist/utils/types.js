"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var coffee_lex_1 = require("coffee-lex");
/**
 * Determines whether a node represents a function, i.e. `->` or `=>`.
 */
function isFunction(node, allowBound) {
    if (allowBound === void 0) { allowBound = true; }
    return (node.type === 'Function' ||
        node.type === 'GeneratorFunction' ||
        (allowBound && (node.type === 'BoundFunction' || node.type === 'BoundGeneratorFunction')));
}
exports.isFunction = isFunction;
var NON_SEMANTIC_SOURCE_TOKEN_TYPES = [coffee_lex_1.SourceType.COMMENT, coffee_lex_1.SourceType.HERECOMMENT, coffee_lex_1.SourceType.NEWLINE];
/**
 * This isn't a great name because newlines do have semantic meaning in
 * CoffeeScript, but it's close enough.
 */
function isSemanticToken(token) {
    return NON_SEMANTIC_SOURCE_TOKEN_TYPES.indexOf(token.type) < 0;
}
exports.isSemanticToken = isSemanticToken;
