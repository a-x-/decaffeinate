"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = require("@babel/parser");
var automatic_semicolon_insertion_1 = require("automatic-semicolon-insertion");
var magic_string_1 = require("magic-string");
var debug_1 = require("../../utils/debug");
var BABYLON_PLUGINS = [
    'flow',
    'jsx',
    'asyncGenerators',
    'classProperties',
    ['decorators', { decoratorsBeforeExport: true }],
    'doExpressions',
    'functionBind',
    'functionSent',
    'objectRestSpread',
    'optionalChaining'
];
var SemicolonsStage = /** @class */ (function () {
    function SemicolonsStage() {
    }
    SemicolonsStage.run = function (content) {
        var log = debug_1.logger(this.name);
        log(content);
        var editor = new magic_string_1.default(content);
        var ast = parser_1.parse(content, {
            sourceType: 'module',
            plugins: BABYLON_PLUGINS,
            allowReturnOutsideFunction: true,
            tokens: true
        });
        var _a = automatic_semicolon_insertion_1.default(content, ast), insertions = _a.insertions, removals = _a.removals;
        insertions.forEach(function (_a) {
            var index = _a.index, content = _a.content;
            return editor.appendLeft(index, content);
        });
        removals.forEach(function (_a) {
            var start = _a.start, end = _a.end;
            return editor.remove(start, end);
        });
        return {
            code: editor.toString(),
            suggestions: []
        };
    };
    return SemicolonsStage;
}());
exports.default = SemicolonsStage;
