import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import NodePatcher from '../../../patchers/NodePatcher';
import MemberAccessOpPatcher from './MemberAccessOpPatcher';
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
        if (this.parent instanceof MemberAccessOpPatcher) {
            this.overwrite(protoToken.start, protoToken.end, '.prototype.');
        }
        else {
            this.overwrite(protoToken.start, protoToken.end, '.prototype');
        }
    };
    ProtoMemberAccessOpPatcher.prototype.getProtoToken = function () {
        var protoIndex = this.indexOfSourceTokenBetweenSourceIndicesMatching(this.expression.outerEnd, this.contentEnd, function (token) { return token.type === SourceType.PROTO; });
        if (protoIndex) {
            var protoToken = this.sourceTokenAtIndex(protoIndex);
            if (protoToken) {
                return protoToken;
            }
        }
        throw this.error("unable to find '::' token after proto member access");
    };
    return ProtoMemberAccessOpPatcher;
}(NodePatcher));
export default ProtoMemberAccessOpPatcher;
