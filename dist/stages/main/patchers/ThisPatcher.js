"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var suggestions_1 = require("../../../suggestions");
var NodePatcher_1 = require("./../../../patchers/NodePatcher");
var ThisPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ThisPatcher, _super);
    function ThisPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ThisPatcher.prototype.patchAsExpression = function () {
        this.reportTopLevelThisIfNecessary();
        if (this.isShorthandThis()) {
            this.overwrite(this.contentStart, this.contentEnd, 'this');
        }
    };
    ThisPatcher.prototype.isShorthandThis = function () {
        return this.getOriginalSource() === '@';
    };
    ThisPatcher.prototype.isRepeatable = function () {
        return true;
    };
    ThisPatcher.prototype.reportTopLevelThisIfNecessary = function () {
        var scope = this.getScope();
        while (scope.parent &&
            ['Program', 'Function', 'GeneratorFunction', 'Class'].indexOf(scope.containerNode.type) === -1) {
            scope = scope.parent;
        }
        if (scope.containerNode.type === 'Program') {
            this.addSuggestion(suggestions_1.AVOID_TOP_LEVEL_THIS);
        }
    };
    return ThisPatcher;
}(NodePatcher_1.default));
exports.default = ThisPatcher;
