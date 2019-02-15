import * as tslib_1 from "tslib";
import SourceType from 'coffee-lex/dist/SourceType';
import NodePatcher from '../../../patchers/NodePatcher';
import StringPatcher from './StringPatcher';
var CSXElementPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(CSXElementPatcher, _super);
    function CSXElementPatcher(patcherContext, properties, children) {
        var _this = _super.call(this, patcherContext) || this;
        _this.properties = properties;
        _this.children = children;
        return _this;
    }
    CSXElementPatcher.prototype.initialize = function () {
        var e_1, _a, e_2, _b;
        try {
            for (var _c = tslib_1.__values(this.properties), _d = _c.next(); !_d.done; _d = _c.next()) {
                var property = _d.value;
                property.setRequiresExpression();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var _e = tslib_1.__values(this.children), _f = _e.next(); !_f.done; _f = _e.next()) {
                var child = _f.value;
                if (child) {
                    child.setRequiresExpression();
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    CSXElementPatcher.prototype.patchAsExpression = function () {
        var e_3, _a, e_4, _b;
        try {
            for (var _c = tslib_1.__values(this.properties), _d = _c.next(); !_d.done; _d = _c.next()) {
                var property = _d.value;
                if (property instanceof StringPatcher && property.expressions.length > 0) {
                    this.patchStringProperty(property);
                }
                else {
                    property.patch();
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        try {
            for (var _e = tslib_1.__values(this.children), _f = _e.next(); !_f.done; _f = _e.next()) {
                var child = _f.value;
                if (child) {
                    child.patch();
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    /**
     * Patch a property that is definitely a string and may or may not already be surrounded by braces.
     */
    CSXElementPatcher.prototype.patchStringProperty = function (property) {
        var prevIndex = property.contentStartTokenIndex.previous();
        if (!prevIndex) {
            throw this.error('Expected index before string property.');
        }
        var prevToken = this.sourceTokenAtIndex(prevIndex);
        if (prevToken &&
            prevToken.type === SourceType.OPERATOR &&
            this.context.source.slice(prevToken.start, prevToken.end) === '=') {
            this.insert(property.outerStart, '{');
            property.patch();
            this.insert(property.outerEnd, '}');
        }
        else {
            property.patch();
        }
    };
    return CSXElementPatcher;
}(NodePatcher));
export default CSXElementPatcher;
