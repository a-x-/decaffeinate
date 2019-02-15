"use strict";
/* eslint-disable no-process-exit */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = require("mz/fs");
var path_1 = require("path");
var index_1 = require("./index");
var PatchError_1 = require("./utils/PatchError");
var pkg = require('../package');
/**
 * Run the script with the user-supplied arguments.
 */
function run(args) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var options;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = parseArguments(args);
                    if (!options.paths.length) return [3 /*break*/, 2];
                    return [4 /*yield*/, runWithPaths(options.paths, options)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, runWithStdio(options)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.default = run;
function parseArguments(args) {
    var paths = [];
    var baseOptions = {};
    var modernizeJS = false;
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        switch (arg) {
            case '-h':
            case '--help':
                usage();
                process.exit(0);
                break;
            case '-v':
            case '--version':
                version();
                process.exit(0);
                break;
            case '--use-cs2':
                baseOptions.useCS2 = true;
                break;
            case '--modernize-js':
                modernizeJS = true;
                break;
            case '--literate':
                baseOptions.literate = true;
                break;
            case '--disable-suggestion-comment':
                baseOptions.disableSuggestionComment = true;
                break;
            case '--no-array-includes':
                baseOptions.noArrayIncludes = true;
                break;
            case '--use-optional-chaining':
                baseOptions.useOptionalChaining = true;
                break;
            case '--use-js-modules':
                baseOptions.useJSModules = true;
                break;
            case '--loose-js-modules':
                baseOptions.looseJSModules = true;
                break;
            case '--safe-import-function-identifiers':
                i++;
                baseOptions.safeImportFunctionIdentifiers = args[i].split(',');
                break;
            case '--prefer-let':
                baseOptions.preferLet = true;
                break;
            case '--disable-babel-constructor-workaround':
                baseOptions.disableBabelConstructorWorkaround = true;
                break;
            case '--disallow-invalid-constructors':
                baseOptions.disallowInvalidConstructors = true;
                break;
            case '--loose':
                baseOptions.loose = true;
                break;
            case '--loose-default-params':
                baseOptions.looseDefaultParams = true;
                break;
            case '--loose-for-expressions':
                baseOptions.looseForExpressions = true;
                break;
            case '--loose-for-of':
                baseOptions.looseForOf = true;
                break;
            case '--loose-includes':
                baseOptions.looseIncludes = true;
                break;
            case '--loose-comparison-negation':
                baseOptions.looseComparisonNegation = true;
                break;
            // Legacy options that are now a no-op.
            case '--prefer-const':
            case '--keep-commonjs':
            case '--enable-babel-constructor-workaround':
                break;
            // Legacy options that are now aliases for other options.
            case '--force-default-export':
                baseOptions.useJSModules = true;
                break;
            case '--allow-invalid-constructors':
                baseOptions.disableBabelConstructorWorkaround = true;
                break;
            default:
                if (arg.startsWith('-')) {
                    console.error("Error: unrecognized option '" + arg + "'");
                    process.exit(1);
                }
                paths.push(arg);
                break;
        }
    }
    return { paths: paths, baseOptions: baseOptions, modernizeJS: modernizeJS };
}
/**
 * Run decaffeinate on the given paths, changing them in place.
 */
function runWithPaths(paths, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        function processPath(path) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var info;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fs_1.stat(path)];
                        case 1:
                            info = _a.sent();
                            if (!info.isDirectory()) return [3 /*break*/, 3];
                            return [4 /*yield*/, processDirectory(path)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, processFile(path)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        function processDirectory(path) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var e_2, _a, children, children_1, children_1_1, child, childPath, childStat, e_2_1;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, fs_1.readdir(path)];
                        case 1:
                            children = _b.sent();
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 13, 14, 15]);
                            children_1 = tslib_1.__values(children), children_1_1 = children_1.next();
                            _b.label = 3;
                        case 3:
                            if (!!children_1_1.done) return [3 /*break*/, 12];
                            child = children_1_1.value;
                            childPath = path_1.join(path, child);
                            return [4 /*yield*/, fs_1.stat(childPath)];
                        case 4:
                            childStat = _b.sent();
                            if (!childStat.isDirectory()) return [3 /*break*/, 6];
                            return [4 /*yield*/, processDirectory(childPath)];
                        case 5:
                            _b.sent();
                            return [3 /*break*/, 11];
                        case 6:
                            if (!options.modernizeJS) return [3 /*break*/, 9];
                            if (!child.endsWith('.js')) return [3 /*break*/, 8];
                            return [4 /*yield*/, processPath(childPath)];
                        case 7:
                            _b.sent();
                            _b.label = 8;
                        case 8: return [3 /*break*/, 11];
                        case 9:
                            if (!(child.endsWith('.coffee') || child.endsWith('.litcoffee') || child.endsWith('.coffee.md'))) return [3 /*break*/, 11];
                            return [4 /*yield*/, processPath(childPath)];
                        case 10:
                            _b.sent();
                            _b.label = 11;
                        case 11:
                            children_1_1 = children_1.next();
                            return [3 /*break*/, 3];
                        case 12: return [3 /*break*/, 15];
                        case 13:
                            e_2_1 = _b.sent();
                            e_2 = { error: e_2_1 };
                            return [3 /*break*/, 15];
                        case 14:
                            try {
                                if (children_1_1 && !children_1_1.done && (_a = children_1.return)) _a.call(children_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                            return [7 /*endfinally*/];
                        case 15: return [2 /*return*/];
                    }
                });
            });
        }
        function processFile(path) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var extension, outputPath, data, resultCode;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            extension = path.endsWith('.coffee.md') ? '.coffee.md' : path_1.extname(path);
                            outputPath = path_1.join(path_1.dirname(path), path_1.basename(path, extension)) + '.js';
                            console.log(path + " \u2192 " + outputPath);
                            return [4 /*yield*/, fs_1.readFile(path, 'utf8')];
                        case 1:
                            data = _a.sent();
                            resultCode = runWithCode(path, data, options);
                            return [4 /*yield*/, fs_1.writeFile(outputPath, resultCode)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        var e_1, _a, paths_1, paths_1_1, path, e_1_1;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 7]);
                    paths_1 = tslib_1.__values(paths), paths_1_1 = paths_1.next();
                    _b.label = 1;
                case 1:
                    if (!!paths_1_1.done) return [3 /*break*/, 4];
                    path = paths_1_1.value;
                    return [4 /*yield*/, processPath(path)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    paths_1_1 = paths_1.next();
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 7];
                case 6:
                    try {
                        if (paths_1_1 && !paths_1_1.done && (_a = paths_1.return)) _a.call(paths_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function runWithStdio(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    var data = '';
                    process.stdin.on('data', function (chunk) { return (data += chunk); });
                    process.stdin.on('end', function () {
                        var resultCode = runWithCode('stdin', data, options);
                        process.stdout.write(resultCode);
                        resolve();
                    });
                })];
        });
    });
}
/**
 * Run decaffeinate on the given code string and return the resulting code.
 */
function runWithCode(name, code, options) {
    var baseOptions = Object.assign({ filename: name }, options.baseOptions);
    try {
        if (options.modernizeJS) {
            return index_1.modernizeJS(code, baseOptions).code;
        }
        else {
            return index_1.convert(code, baseOptions).code;
        }
    }
    catch (err) {
        if (PatchError_1.default.detect(err)) {
            console.error(name + ": " + PatchError_1.default.prettyPrint(err));
            process.exit(1);
        }
        throw err;
    }
}
/**
 * Print version
 */
function version() {
    console.log('%s v%s', pkg.name, pkg.version);
}
/**
 * Print usage help.
 */
function usage() {
    var exe = path_1.basename(process.argv[1]);
    console.log('%s [OPTIONS] PATH [PATH …]', exe);
    console.log('%s [OPTIONS] < INPUT', exe);
    console.log();
    console.log('Move your CoffeeScript source to JavaScript using modern syntax.');
    console.log();
    console.log('OPTIONS');
    console.log();
    console.log('  -h, --help               Display this help message.');
    console.log('  --use-cs2                Treat the input as CoffeeScript 2 code. CoffeeScript 2 has');
    console.log('                           some small breaking changes and differences in behavior');
    console.log('                           compared with CS1, so decaffeinate assumes CS1 by default');
    console.log('                           and allows CS2 via this flag.');
    console.log('  --modernize-js           Treat the input as JavaScript and only run the');
    console.log('                           JavaScript-to-JavaScript transforms, modifying the file(s)');
    console.log('                           in-place.');
    console.log('  --literate               Treat the input file as Literate CoffeeScript.');
    console.log('  --disable-suggestion-comment');
    console.log('                           Do not include a comment with followup suggestions at the');
    console.log('                           top of the output file.');
    console.log('  --no-array-includes      Do not use Array.prototype.includes in generated code.');
    console.log('  --use-optional-chaining  Use the upcoming optional chaining syntax for operators like `?.`.');
    console.log('  --use-js-modules         Convert require and module.exports to import and export.');
    console.log('  --loose-js-modules       Allow named exports when converting to JS modules.');
    console.log('  --safe-import-function-identifiers');
    console.log('                           Comma-separated list of function names that may safely be in the ');
    console.log('                           import/require section of the file. All other function calls ');
    console.log('                           will disqualify later requires from being converted to imports.');
    console.log('  --prefer-let             Use let instead of const for most variables in output code.');
    console.log('  --loose                  Enable all --loose... options.');
    console.log('  --loose-default-params   Convert CS default params to JS default params.');
    console.log('  --loose-for-expressions  Do not wrap expression loop targets in Array.from.');
    console.log('  --loose-for-of           Do not wrap JS for...of loop targets in Array.from.');
    console.log('  --loose-includes         Do not wrap in Array.from when converting in to includes.');
    console.log('  --loose-comparison-negation');
    console.log('                           Allow unsafe simplifications like `!(a > b)` to `a <= b`.');
    console.log('  --disable-babel-constructor-workaround');
    console.log('                           Never include the Babel/TypeScript workaround code to allow');
    console.log('                           this before super in constructors.');
    console.log('  --disallow-invalid-constructors');
    console.log('                           Give an error when constructors use this before super or');
    console.log('                           omit the super call in a subclass.');
    console.log();
    console.log('EXAMPLES');
    console.log();
    console.log('  # Convert a .coffee file to a .js file.');
    console.log('  $ decaffeinate index.coffee');
    console.log();
    console.log('  # Pipe an example from the command-line.');
    console.log('  $ echo "a = 1" | decaffeinate');
    console.log();
    console.log('  # On macOS this may come in handy:');
    console.log('  $ pbpaste | decaffeinate | pbcopy');
    console.log();
    console.log('  # Process everything in a directory.');
    console.log('  $ decaffeinate src/');
    console.log();
    console.log('  # Redirect input from a file.');
    console.log('  $ decaffeinate < index.coffee');
}
