import { ArrayInitialiser, AssignOp, BaseFunction, Class, CompoundAssignOp, DefaultParam, Expansion, For, Identifier, MemberAccessOp, ObjectInitialiser, PostDecrementOp, PostIncrementOp, PreDecrementOp, PreIncrementOp, Rest, Try } from 'decaffeinate-parser/dist/nodes';
import flatMap from './flatMap';
import isReservedWord from './isReservedWord';
import leftHandIdentifiers from './leftHandIdentifiers';
/**
 * Represents a CoffeeScript scope and its bindings.
 */
var Scope = /** @class */ (function () {
    function Scope(containerNode, parent) {
        if (parent === void 0) { parent = null; }
        this.containerNode = containerNode;
        this.parent = parent;
        this.bindings = Object.create(parent ? parent.bindings : {});
        this.modificationsAfterDeclaration = {};
        this.innerClosureModifications = {};
    }
    Scope.prototype.getBinding = function (name) {
        return this.bindings[this.key(name)] || null;
    };
    Scope.prototype.isBindingAvailable = function (name) {
        return !this.getBinding(name) && !isReservedWord(name);
    };
    Scope.prototype.hasBinding = function (name) {
        return this.getBinding(name) !== null;
    };
    Scope.prototype.hasModificationAfterDeclaration = function (name) {
        return this.modificationsAfterDeclaration[this.key(name)] || false;
    };
    Scope.prototype.hasInnerClosureModification = function (name) {
        return this.innerClosureModifications[this.key(name)] || false;
    };
    Scope.prototype.getOwnNames = function () {
        var _this = this;
        return Object.getOwnPropertyNames(this.bindings).map(function (key) { return _this.unkey(key); });
    };
    Scope.prototype.hasOwnBinding = function (name) {
        return this.bindings.hasOwnProperty(this.key(name));
    };
    /**
     * Mark that the given name is explicitly declared, e.g. in a parameter.
     */
    Scope.prototype.declares = function (name, node) {
        var key = this.key(name);
        this.bindings[key] = node;
    };
    /**
     * Mark that the given name is part of an assignment. This might introduce a
     * new variable or might set an existing variable, depending on context.
     */
    Scope.prototype.assigns = function (name, node) {
        if (!this.bindings[this.key(name)]) {
            // Not defined in this or any parent scope.
            this.declares(name, node);
        }
        else {
            this.modifies(name);
        }
    };
    /**
     * Mark that the given name is part of a modification, e.g. `+=` or `++`.
     */
    Scope.prototype.modifies = function (name) {
        var scope = this;
        while (scope) {
            if (scope.hasOwnBinding(name)) {
                scope.modificationsAfterDeclaration[this.key(name)] = true;
                if (scope !== this) {
                    scope.innerClosureModifications[this.key(name)] = true;
                }
                break;
            }
            scope = scope.parent;
        }
    };
    Scope.prototype.claimFreeBinding = function (node, name) {
        var _this = this;
        if (name === void 0) { name = null; }
        if (!name) {
            name = 'ref';
        }
        var names = Array.isArray(name) ? name : [name];
        var binding = names.find(function (name) { return _this.isBindingAvailable(name); });
        if (!binding) {
            var counter_1 = 0;
            while (!binding) {
                if (counter_1 > 1000) {
                    throw new Error("Unable to find free binding for names " + names.toString());
                }
                counter_1 += 1;
                binding = names.find(function (name) { return _this.isBindingAvailable("" + name + counter_1); });
            }
            binding = "" + binding + counter_1;
        }
        this.declares(binding, node);
        return binding;
    };
    /**
     * @private
     */
    Scope.prototype.key = function (name) {
        return "$" + name;
    };
    /**
     * @private
     */
    Scope.prototype.unkey = function (key) {
        return key.slice(1);
    };
    /**
     * Handles declarations or assigns for any bindings for a given node.
     */
    Scope.prototype.processNode = function (node) {
        var _this = this;
        if (node instanceof AssignOp) {
            leftHandIdentifiers(node.assignee).forEach(function (identifier) { return _this.assigns(identifier.data, identifier); });
        }
        else if (node instanceof CompoundAssignOp) {
            if (node.assignee instanceof Identifier) {
                this.modifies(node.assignee.data);
            }
        }
        else if (node instanceof PostDecrementOp ||
            node instanceof PostIncrementOp ||
            node instanceof PreDecrementOp ||
            node instanceof PreIncrementOp) {
            if (node.expression instanceof Identifier) {
                this.modifies(node.expression.data);
            }
        }
        else if (node instanceof BaseFunction) {
            getBindingsForNode(node).forEach(function (identifier) { return _this.declares(identifier.data, identifier); });
        }
        else if (node instanceof For) {
            [node.keyAssignee, node.valAssignee].forEach(function (assignee) {
                if (assignee) {
                    leftHandIdentifiers(assignee).forEach(function (identifier) { return _this.assigns(identifier.data, identifier); });
                }
            });
        }
        else if (node instanceof Try) {
            if (node.catchAssignee) {
                leftHandIdentifiers(node.catchAssignee).forEach(function (identifier) { return _this.assigns(identifier.data, identifier); });
            }
        }
        else if (node instanceof Class) {
            if (node.nameAssignee && node.nameAssignee instanceof Identifier && this.parent) {
                // Classes have their own scope, but their name is bound to the parent scope.
                this.parent.assigns(node.nameAssignee.data, node.nameAssignee);
            }
        }
    };
    Scope.prototype.toString = function () {
        var parts = this.getOwnNames();
        if (this.parent) {
            parts.push("parent = " + this.parent.toString());
        }
        return this.constructor.name + " {" + (parts.length > 0 ? " " + parts.join(', ') + " " : '') + "}";
    };
    Scope.prototype.inspect = function () {
        return this.toString();
    };
    return Scope;
}());
export default Scope;
/**
 * Gets all the identifiers representing bindings in `node`.
 */
function getBindingsForNode(node) {
    if (node instanceof BaseFunction) {
        return flatMap(node.parameters, getBindingsForNode);
    }
    else if (node instanceof Identifier || node instanceof ArrayInitialiser || node instanceof ObjectInitialiser) {
        return leftHandIdentifiers(node);
    }
    else if (node instanceof DefaultParam) {
        return getBindingsForNode(node.param);
    }
    else if (node instanceof Rest) {
        return getBindingsForNode(node.expression);
    }
    else if (node instanceof Expansion || node instanceof MemberAccessOp) {
        return [];
    }
    else {
        throw new Error("unexpected parameter type: " + node.type);
    }
}
