"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var esnext_1 = require("esnext");
var debug_1 = require("../../utils/debug");
var EsnextStage = /** @class */ (function () {
    function EsnextStage() {
    }
    EsnextStage.run = function (content, options) {
        var log = debug_1.logger(this.name);
        log(content);
        var plugins = esnext_1.allPlugins;
        if (!options.useJSModules) {
            plugins = plugins.filter(function (plugin) { return plugin.name !== 'modules.commonjs'; });
        }
        var code = esnext_1.convert(content, {
            plugins: plugins,
            'declarations.block-scope': {
                disableConst: function (_a) {
                    var node = _a.node, parent = _a.parent;
                    if (options.preferLet) {
                        return (
                        // Only use `const` for top-level variables…
                        (parent && parent.type !== 'Program') ||
                            // … as the only variable in its declaration …
                            node.declarations.length !== 1 ||
                            // … without any sort of destructuring …
                            node.declarations[0].id.type !== 'Identifier' ||
                            // … starting with a capital letter.
                            !/^[$_]?[A-Z]+$/.test(node.declarations[0].id.name));
                    }
                    else {
                        return false;
                    }
                }
            },
            'modules.commonjs': {
                forceDefaultExport: !options.looseJSModules,
                safeFunctionIdentifiers: options.safeImportFunctionIdentifiers
            }
        }).code;
        return {
            code: code,
            suggestions: []
        };
    };
    return EsnextStage;
}());
exports.default = EsnextStage;
