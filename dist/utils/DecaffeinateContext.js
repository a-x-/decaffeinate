"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var decaffeinate_parser_1 = require("decaffeinate-parser");
var Scope_1 = require("./Scope");
/**
 * Class that provides access to various useful things to know about
 * CoffeeScript source code, particularly the decaffeinate-parser AST.
 */
var DecaffeinateContext = /** @class */ (function () {
    function DecaffeinateContext(programNode, source, sourceTokens, coffeeAST, linesAndColumns, parentMap, scopeMap) {
        this.programNode = programNode;
        this.source = source;
        this.sourceTokens = sourceTokens;
        this.coffeeAST = coffeeAST;
        this.linesAndColumns = linesAndColumns;
        this.parentMap = parentMap;
        this.scopeMap = scopeMap;
    }
    DecaffeinateContext.create = function (source, useCS2) {
        var program = decaffeinate_parser_1.parse(source, { useCS2: useCS2 });
        return new DecaffeinateContext(program, source, program.context.sourceTokens, program.context.ast, program.context.linesAndColumns, computeParentMap(program), computeScopeMap(program));
    };
    DecaffeinateContext.prototype.getParent = function (node) {
        var result = this.parentMap.get(node);
        if (result === undefined) {
            throw new Error('Unexpected parent lookup; node was not in the map.');
        }
        return result;
    };
    DecaffeinateContext.prototype.getScope = function (node) {
        var result = this.scopeMap.get(node);
        if (result === undefined) {
            throw new Error('Unexpected scope lookup; node was not in the map.');
        }
        return result;
    };
    return DecaffeinateContext;
}());
exports.default = DecaffeinateContext;
function computeParentMap(program) {
    var resultMap = new Map();
    decaffeinate_parser_1.traverse(program, function (node, parent) {
        resultMap.set(node, parent);
    });
    return resultMap;
}
function computeScopeMap(program) {
    var scopeMap = new Map();
    decaffeinate_parser_1.traverse(program, function (node, parent) {
        var scope;
        switch (node.type) {
            case 'Program':
                scope = new Scope_1.default(node);
                break;
            case 'Function':
            case 'BoundFunction':
            case 'GeneratorFunction':
            case 'BoundGeneratorFunction':
            case 'Class': {
                var parentScope = parent && scopeMap.get(parent);
                if (!parentScope) {
                    throw new Error('Expected to find parent scope.');
                }
                scope = new Scope_1.default(node, parentScope);
                break;
            }
            default: {
                var parentScope = parent && scopeMap.get(parent);
                if (!parentScope) {
                    throw new Error('Expected to find parent scope.');
                }
                scope = parentScope;
                break;
            }
        }
        scope.processNode(node);
        scopeMap.set(node, scope);
    });
    return scopeMap;
}
