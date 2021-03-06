import { allPlugins, convert } from 'esnext';
import { logger } from '../../utils/debug';
var EsnextStage = /** @class */ (function () {
    function EsnextStage() {
    }
    EsnextStage.run = function (content, options) {
        var log = logger(this.name);
        log(content);
        var plugins = allPlugins;
        if (!options.useJSModules) {
            plugins = plugins.filter(function (plugin) { return plugin.name !== 'modules.commonjs'; });
        }
        var code = convert(content, {
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
export default EsnextStage;
