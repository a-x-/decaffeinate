"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var magic_string_1 = require("magic-string");
var debug_1 = require("../utils/debug");
var DecaffeinateContext_1 = require("../utils/DecaffeinateContext");
var notNull_1 = require("../utils/notNull");
var PatchError_1 = require("../utils/PatchError");
var TransformCoffeeScriptStage = /** @class */ (function () {
    function TransformCoffeeScriptStage(ast, context, editor, options) {
        this.ast = ast;
        this.context = context;
        this.editor = editor;
        this.options = options;
        this.root = null;
        this.patchers = [];
        this.suggestions = [];
    }
    TransformCoffeeScriptStage.run = function (content, options) {
        var log = debug_1.logger(this.name);
        log(content);
        var context = DecaffeinateContext_1.default.create(content, Boolean(options.useCS2));
        var editor = new magic_string_1.default(content);
        var stage = new this(context.programNode, context, editor, options);
        var patcher = stage.build();
        patcher.patch();
        return {
            code: editor.toString(),
            suggestions: stage.suggestions
        };
    };
    /**
     * This should be overridden in subclasses.
     */
    TransformCoffeeScriptStage.prototype.patcherConstructorForNode = function (_node) {
        // eslint-disable-line no-unused-vars
        return null;
    };
    TransformCoffeeScriptStage.prototype.build = function () {
        this.root = this.patcherForNode(this.ast);
        // Note that initialize is called in bottom-up order.
        this.patchers.forEach(function (patcher) { return patcher.initialize(); });
        return this.root;
    };
    TransformCoffeeScriptStage.prototype.patcherForNode = function (node, parent, property) {
        var _this = this;
        if (parent === void 0) { parent = null; }
        if (property === void 0) { property = null; }
        var constructor = this._patcherConstructorForNode(node);
        if (parent) {
            var override = parent.patcherClassForChildNode(node, notNull_1.default(property));
            if (override) {
                constructor = override;
            }
        }
        var children = node.getChildNames().map(function (name) {
            var child = node[name];
            if (!child) {
                return null;
            }
            else if (Array.isArray(child)) {
                return child.map(function (item) { return (item ? _this.patcherForNode(item, constructor, name) : null); });
            }
            else {
                return _this.patcherForNode(child, constructor, name);
            }
        });
        var patcherContext = {
            node: node,
            context: this.context,
            editor: this.editor,
            options: this.options,
            addSuggestion: function (suggestion) {
                _this.suggestions.push(suggestion);
            }
        };
        var patcher = new (constructor.bind.apply(constructor, tslib_1.__spread([void 0, patcherContext], children)))();
        this.patchers.push(patcher);
        this.associateParent(patcher, children);
        return patcher;
    };
    TransformCoffeeScriptStage.prototype.associateParent = function (parent, child) {
        var _this = this;
        if (Array.isArray(child)) {
            child.forEach(function (item) { return _this.associateParent(parent, item); });
        }
        else if (child) {
            child.parent = parent;
        }
    };
    TransformCoffeeScriptStage.prototype._patcherConstructorForNode = function (node) {
        var constructor = this.patcherConstructorForNode(node);
        if (constructor === null) {
            var props = node.getChildNames();
            throw new PatchError_1.default("no patcher available for node type: " + node.type + ("" + (props.length ? " (props: " + props.join(', ') + ")" : '')), this.context.source, node.start, node.end);
        }
        return constructor.patcherClassOverrideForNode(node) || constructor;
    };
    return TransformCoffeeScriptStage;
}());
exports.default = TransformCoffeeScriptStage;
