import * as tslib_1 from "tslib";
export var DEFAULT_OPTIONS = {
    filename: 'input.coffee',
    useCS2: false,
    runToStage: null,
    literate: false,
    disableSuggestionComment: false,
    useOptionalChaining: false,
    noArrayIncludes: false,
    useJSModules: false,
    looseJSModules: false,
    safeImportFunctionIdentifiers: [],
    preferLet: false,
    loose: false,
    looseDefaultParams: false,
    looseForExpressions: false,
    looseForOf: false,
    looseIncludes: false,
    looseComparisonNegation: false,
    disableBabelConstructorWorkaround: false,
    disallowInvalidConstructors: false
};
export function resolveOptions(options) {
    if (options.loose) {
        options = tslib_1.__assign({}, options, { looseDefaultParams: true, looseForExpressions: true, looseForOf: true, looseIncludes: true, looseComparisonNegation: true, looseJSModules: true });
    }
    return tslib_1.__assign({}, DEFAULT_OPTIONS, options);
}
