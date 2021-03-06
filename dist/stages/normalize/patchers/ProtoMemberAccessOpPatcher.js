"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var NodePatcher_1 = require("../../../patchers/NodePatcher");
var MemberAccessOpPatcher_1 = require("./MemberAccessOpPatcher");
var ProtoMemberAccessOpPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ProtoMemberAccessOpPatcher, _super);
    function ProtoMemberAccessOpPatcher(patcherContext, expression) {
        var _this = _super.call(this, patcherContext) || this;
        _this.expression = expression;
        return _this;
    }
    ProtoMemberAccessOpPatcher.prototype.patchAsExpression = function () {
        this.expression.patch();
        // `a::b` → `a.prototype.b`
        //   ^^       ^^^^^^^^^^
        var protoToken = this.getProtoToken();
        if (this.parent instanceof MemberAccessOpPatcher_1.default) {
            this.overwrite(protoToken.start, protoToken.end, '.prototype.');
        }
        else {
            this.overwrite(protoToken.start, protoToken.end, '.prototype');
        }
    };
    ProtoMemberAccessOpPatcher.prototype.getProtoToken = function () {
        var protoIndex = this.indexOfSourceTokenBetweenSourceIndicesMatching(this.expression.outerEnd, this.contentEnd, function (token) { return token.type === coffee_lex_1.SourceType.PROTO; });
        if (protoIndex) {
            var protoToken = this.sourceTokenAtIndex(protoIndex);
            if (protoToken) {
                return protoToken;
            }
        }
        throw this.error("unable to find '::' token after proto member access");
    };
    return ProtoMemberAccessOpPatcher;
}(NodePatcher_1.default));
exports.default = ProtoMemberAccessOpPatcher;
