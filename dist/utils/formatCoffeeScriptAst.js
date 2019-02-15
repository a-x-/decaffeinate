"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var nodes_1 = require("decaffeinate-coffeescript/lib/coffee-script/nodes");
var nodes_2 = require("decaffeinate-coffeescript2/lib/coffeescript/nodes");
var formatCoffeeScriptLocationData_1 = require("./formatCoffeeScriptLocationData");
function formatCoffeeScriptAst(program, context) {
    var resultLines = formatAstNodeLines(program, context);
    return resultLines.map(function (line) { return line + '\n'; }).join('');
}
exports.default = formatCoffeeScriptAst;
function formatAstNodeLines(node, context) {
    var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
    var propLines = [];
    var blacklistedProps = ['locationData'];
    try {
        // Show the non-node children first.
        for (var _e = tslib_1.__values(Object.keys(node)), _f = _e.next(); !_f.done; _f = _e.next()) {
            var key = _f.value;
            var value = node[key];
            if (shouldTraverse(value) || blacklistedProps.indexOf(key) !== -1) {
                continue;
            }
            var valueText = void 0;
            try {
                valueText = JSON.stringify(value);
            }
            catch (e) {
                valueText = '(error)';
            }
            propLines.push(key + ": " + valueText);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        // Then show the node children.
        for (var _g = tslib_1.__values(Object.keys(node)), _h = _g.next(); !_h.done; _h = _g.next()) {
            var key = _h.value;
            var value = node[key];
            if (!shouldTraverse(value)) {
                continue;
            }
            if (Array.isArray(value) && value.length === 0) {
                propLines.push(key + ": []");
            }
            else if (Array.isArray(value)) {
                propLines.push(key + ": [");
                try {
                    for (var value_1 = tslib_1.__values(value), value_1_1 = value_1.next(); !value_1_1.done; value_1_1 = value_1.next()) {
                        var child = value_1_1.value;
                        if (Array.isArray(child)) {
                            propLines.push("  [");
                            try {
                                for (var child_1 = tslib_1.__values(child), child_1_1 = child_1.next(); !child_1_1.done; child_1_1 = child_1.next()) {
                                    var grandchild = child_1_1.value;
                                    propLines.push.apply(propLines, tslib_1.__spread(formatAstNodeLines(grandchild, context).map(function (s) { return '    ' + s; })));
                                }
                            }
                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                            finally {
                                try {
                                    if (child_1_1 && !child_1_1.done && (_d = child_1.return)) _d.call(child_1);
                                }
                                finally { if (e_4) throw e_4.error; }
                            }
                            propLines.push("  ]");
                        }
                        else {
                            propLines.push.apply(propLines, tslib_1.__spread(formatAstNodeLines(child, context).map(function (s) { return '  ' + s; })));
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (value_1_1 && !value_1_1.done && (_c = value_1.return)) _c.call(value_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                propLines.push("]");
            }
            else {
                var childLines = formatAstNodeLines(value, context);
                childLines[0] = key + ": " + childLines[0];
                propLines.push.apply(propLines, tslib_1.__spread(childLines));
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return tslib_1.__spread([
        node.constructor.name + " " + formatCoffeeScriptLocationData_1.default(node.locationData, context) + " {"
    ], propLines.map(function (s) { return '  ' + s; }), [
        '}'
    ]);
}
// tslint:disable-next-line no-any
function shouldTraverse(value) {
    if (Array.isArray(value)) {
        return value.length === 0 || shouldTraverse(value[0]);
    }
    return value instanceof nodes_1.Base || value instanceof nodes_2.Base;
}
