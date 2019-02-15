"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var coffee_lex_1 = require("coffee-lex");
function formatCoffeeLexTokens(tokens, context) {
    var resultLines = tokens.map(function (token) { return context.formatRange(token.start, token.end) + ": " + coffee_lex_1.SourceType[token.type]; });
    return resultLines.map(function (line) { return line + '\n'; }).join('');
}
exports.default = formatCoffeeLexTokens;
