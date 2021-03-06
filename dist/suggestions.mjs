import * as tslib_1 from "tslib";
export var REMOVE_BABEL_WORKAROUND = {
    suggestionCode: 'DS001',
    message: 'Remove Babel/TypeScript constructor workaround'
};
export var REMOVE_ARRAY_FROM = {
    suggestionCode: 'DS101',
    message: 'Remove unnecessary use of Array.from'
};
export var CLEAN_UP_IMPLICIT_RETURNS = {
    suggestionCode: 'DS102',
    message: 'Remove unnecessary code created because of implicit returns'
};
export var REMOVE_GUARD = {
    suggestionCode: 'DS103',
    message: 'Rewrite code to no longer use __guard__'
};
export var AVOID_INLINE_ASSIGNMENTS = {
    suggestionCode: 'DS104',
    message: 'Avoid inline assignments'
};
export var SIMPLIFY_COMPLEX_ASSIGNMENTS = {
    suggestionCode: 'DS201',
    message: 'Simplify complex destructure assignments'
};
export var SIMPLIFY_DYNAMIC_RANGE_LOOPS = {
    suggestionCode: 'DS202',
    message: 'Simplify dynamic range loops'
};
export var CLEAN_UP_FOR_OWN_LOOPS = {
    suggestionCode: 'DS203',
    message: 'Remove `|| {}` from converted for-own loops'
};
export var FIX_INCLUDES_EVALUATION_ORDER = {
    suggestionCode: 'DS204',
    message: 'Change includes calls to have a more natural evaluation order'
};
export var AVOID_IIFES = {
    suggestionCode: 'DS205',
    message: 'Consider reworking code to avoid use of IIFEs'
};
export var AVOID_INITCLASS = {
    suggestionCode: 'DS206',
    message: 'Consider reworking classes to avoid initClass'
};
export var SHORTEN_NULL_CHECKS = {
    suggestionCode: 'DS207',
    message: 'Consider shorter variations of null checks'
};
export var AVOID_TOP_LEVEL_THIS = {
    suggestionCode: 'DS208',
    message: 'Avoid top-level this'
};
export var AVOID_TOP_LEVEL_RETURN = {
    suggestionCode: 'DS209',
    message: 'Avoid top-level return'
};
export function mergeSuggestions(suggestions) {
    var e_1, _a;
    var suggestionsByCode = {};
    try {
        for (var suggestions_1 = tslib_1.__values(suggestions), suggestions_1_1 = suggestions_1.next(); !suggestions_1_1.done; suggestions_1_1 = suggestions_1.next()) {
            var suggestion = suggestions_1_1.value;
            suggestionsByCode[suggestion.suggestionCode] = suggestion;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (suggestions_1_1 && !suggestions_1_1.done && (_a = suggestions_1.return)) _a.call(suggestions_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return Object.keys(suggestionsByCode)
        .sort()
        .map(function (code) { return suggestionsByCode[code]; });
}
export function prependSuggestionComment(code, suggestions) {
    if (suggestions.length === 0) {
        return code;
    }
    var commentLines = tslib_1.__spread([
        '/*',
        ' * decaffeinate suggestions:'
    ], suggestions.map(function (_a) {
        var suggestionCode = _a.suggestionCode, message = _a.message;
        return " * " + suggestionCode + ": " + message;
    }), [
        ' * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md',
        ' */'
    ]);
    var codeLines = code.split('\n');
    if (codeLines[0].startsWith('#!')) {
        return tslib_1.__spread([codeLines[0]], commentLines, codeLines.slice(1)).join('\n');
    }
    else {
        return tslib_1.__spread(commentLines, codeLines).join('\n');
    }
}
