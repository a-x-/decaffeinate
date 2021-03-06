import * as tslib_1 from "tslib";
import MagicString from 'magic-string';
import { logger } from '../utils/debug';
import DecaffeinateContext from '../utils/DecaffeinateContext';
import notNull from '../utils/notNull';
import PatchError from '../utils/PatchError';
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
        var log = logger(this.name);
        log(content);
        var context = DecaffeinateContext.create(content, Boolean(options.useCS2));
        var editor = new MagicString(content);
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
            var override = parent.patcherClassForChildNode(node, notNull(property));
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
            throw new PatchError("no patcher available for node type: " + node.type + ("" + (props.length ? " (props: " + props.join(', ') + ")" : '')), this.context.source, node.start, node.end);
        }
        return constructor.patcherClassOverrideForNode(node) || constructor;
    };
    return TransformCoffeeScriptStage;
}());
export default TransformCoffeeScriptStage;
