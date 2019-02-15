import { SourceType } from 'coffee-lex';
export default function formatCoffeeLexTokens(tokens, context) {
    var resultLines = tokens.map(function (token) { return context.formatRange(token.start, token.end) + ": " + SourceType[token.type]; });
    return resultLines.map(function (line) { return line + '\n'; }).join('');
}
