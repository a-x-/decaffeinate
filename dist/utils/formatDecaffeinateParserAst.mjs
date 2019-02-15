import * as tslib_1 from "tslib";
export default function formatDecaffeinateParserAst(program, context) {
    var resultLines = formatAstNodeLines(program, context);
    return resultLines.map(function (line) { return line + '\n'; }).join('');
}
function formatAstNodeLines(node, context) {
    var e_1, _a, e_2, _b, e_3, _c;
    var propLines = [];
    var childPropNames = node.getChildNames();
    var blacklistedProps = childPropNames.concat([
        'raw',
        'line',
        'column',
        'type',
        'parentNode',
        'context',
        'start',
        'end'
    ]);
    try {
        for (var _d = tslib_1.__values(Object.keys(node)), _e = _d.next(); !_e.done; _e = _d.next()) {
            var key = _e.value;
            if (blacklistedProps.indexOf(key) !== -1) {
                continue;
            }
            var valueText = void 0;
            try {
                valueText = JSON.stringify(node[key]);
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
            if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        for (var childPropNames_1 = tslib_1.__values(childPropNames), childPropNames_1_1 = childPropNames_1.next(); !childPropNames_1_1.done; childPropNames_1_1 = childPropNames_1.next()) {
            var childProp = childPropNames_1_1.value;
            var value = node[childProp];
            if (value === null) {
                propLines.push(childProp + ": null");
            }
            else if (Array.isArray(value) && value.length === 0) {
                propLines.push(childProp + ": []");
            }
            else if (Array.isArray(value)) {
                propLines.push(childProp + ": [");
                try {
                    for (var value_1 = tslib_1.__values(value), value_1_1 = value_1.next(); !value_1_1.done; value_1_1 = value_1.next()) {
                        var child = value_1_1.value;
                        propLines.push.apply(propLines, tslib_1.__spread(formatAstNodeLines(child, context).map(function (s) { return '  ' + s; })));
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
                childLines[0] = childProp + ": " + childLines[0];
                propLines.push.apply(propLines, tslib_1.__spread(childLines));
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (childPropNames_1_1 && !childPropNames_1_1.done && (_b = childPropNames_1.return)) _b.call(childPropNames_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    var rangeStr = context.formatRange(node.start, node.end);
    return tslib_1.__spread([node.type + " " + rangeStr + " {"], propLines.map(function (s) { return '  ' + s; }), ['}']);
}
