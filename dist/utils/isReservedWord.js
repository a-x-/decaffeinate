"use strict";
// Taken from various constants in the CoffeeScript lexer:
// https://github.com/jashkenas/coffeescript/blob/master/src/lexer.coffee
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var JS_KEYWORDS = [
    'true',
    'false',
    'null',
    'this',
    'new',
    'delete',
    'typeof',
    'in',
    'instanceof',
    'return',
    'throw',
    'break',
    'continue',
    'debugger',
    'yield',
    'if',
    'else',
    'switch',
    'for',
    'while',
    'do',
    'try',
    'catch',
    'finally',
    'class',
    'extends',
    'super',
    'import',
    'export',
    'default'
];
var COFFEE_KEYWORDS = ['undefined', 'Infinity', 'NaN', 'then', 'unless', 'until', 'loop', 'of', 'by', 'when'];
var COFFEE_ALIASES = ['and', 'or', 'is', 'isnt', 'not', 'yes', 'no', 'on', 'off'];
var RESERVED = [
    'case',
    'default',
    'function',
    'var',
    'void',
    'with',
    'const',
    'let',
    'enum',
    'export',
    'import',
    'native',
    'implements',
    'interface',
    'package',
    'private',
    'protected',
    'public',
    'static'
];
var STRICT_PROSCRIBED = ['arguments', 'eval'];
var JS_FORBIDDEN = new Set(tslib_1.__spread(JS_KEYWORDS, RESERVED, STRICT_PROSCRIBED));
var RESERVED_WORDS = new Set(tslib_1.__spread(JS_KEYWORDS, COFFEE_KEYWORDS, COFFEE_ALIASES, RESERVED, STRICT_PROSCRIBED, [
    // Mentioned in https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Future_reserved_keywords
    'await'
]));
/**
 * Determine if the given string is a reserved word in either CoffeeScript or
 * JavaScript, useful to avoid generating variables with these names. Sometimes
 * we generate CoffeeScript and sometimes JavaScript, so just avoid names that
 * are reserved in either language.
 */
function isReservedWord(name) {
    return RESERVED_WORDS.has(name);
}
exports.default = isReservedWord;
/**
 * Determine if the given name should not be used as a JavaScript variable,
 * conforming to CoffeeScript's equivalent implementation.
 */
function isForbiddenJsName(name) {
    return JS_FORBIDDEN.has(name);
}
exports.isForbiddenJsName = isForbiddenJsName;
