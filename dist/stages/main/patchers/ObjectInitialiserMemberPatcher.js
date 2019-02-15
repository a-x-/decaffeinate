"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SourceType_1 = require("coffee-lex/dist/SourceType");
var nodes_1 = require("decaffeinate-parser/dist/nodes");
var MemberAccessOpPatcher_1 = require("./MemberAccessOpPatcher");
var ObjectBodyMemberPatcher_1 = require("./ObjectBodyMemberPatcher");
var StringPatcher_1 = require("./StringPatcher");
var ThisPatcher_1 = require("./ThisPatcher");
/**
 * Handles object properties.
 */
var ObjectInitialiserMemberPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ObjectInitialiserMemberPatcher, _super);
    function ObjectInitialiserMemberPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ObjectInitialiserMemberPatcher.prototype.setAssignee = function () {
        if (this.expression === null) {
            this.key.setAssignee();
        }
        else {
            this.expression.setAssignee();
        }
        _super.prototype.setAssignee.call(this);
    };
    ObjectInitialiserMemberPatcher.prototype.patchAsProperty = function () {
        if (this.expression === null) {
            var shouldExpand = !(this.key.node instanceof nodes_1.Identifier) || this.node.isComputed;
            this.patchAsShorthand({
                expand: shouldExpand
            });
        }
        else {
            _super.prototype.patchAsProperty.call(this);
        }
    };
    /**
     * @private
     */
    ObjectInitialiserMemberPatcher.prototype.patchAsShorthand = function (_a) {
        var _b = _a.expand, expand = _b === void 0 ? false : _b;
        var key = this.key;
        if (key instanceof MemberAccessOpPatcher_1.default) {
            key.patch();
            // e.g. `{ @name }`
            if (!(key.expression instanceof ThisPatcher_1.default)) {
                throw this.error("expected property key member access on 'this', e.g. '@name'");
            }
            // `{ @name }` → `{ name: @name }`
            //                  ^^^^^^
            this.insert(key.outerStart, key.getMemberName() + ": ");
        }
        else if (expand) {
            var needsBrackets = key instanceof StringPatcher_1.default && key.shouldBecomeTemplateLiteral();
            if (needsBrackets) {
                // `{ `a = ${1 + 1}` }` → `{ [`a = ${1 + 1}` }`
                //                           ^
                this.insert(key.outerStart, '[');
            }
            var valueCode = key.patchRepeatable();
            if (needsBrackets) {
                this.insert(key.outerEnd, ']');
            }
            var keyEnd = void 0;
            if (this.node.isComputed) {
                var closeBracketToken = key.outerEndTokenIndex.next();
                var tokenAfterLast = closeBracketToken ? this.sourceTokenAtIndex(closeBracketToken) : null;
                if (!tokenAfterLast || tokenAfterLast.type !== SourceType_1.default.RBRACKET) {
                    throw this.error('Expected close-bracket after computed property.');
                }
                keyEnd = tokenAfterLast.end;
            }
            else {
                keyEnd = key.outerEnd;
            }
            // `{ a } → { a: a }`
            //             ^^^
            this.insert(keyEnd, ": " + valueCode);
        }
    };
    return ObjectInitialiserMemberPatcher;
}(ObjectBodyMemberPatcher_1.default));
exports.default = ObjectInitialiserMemberPatcher;
