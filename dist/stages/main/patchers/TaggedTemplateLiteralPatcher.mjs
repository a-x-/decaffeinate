import * as tslib_1 from "tslib";
import NodePatcher from '../../../patchers/NodePatcher';
var TaggedTemplateLiteralPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(TaggedTemplateLiteralPatcher, _super);
    function TaggedTemplateLiteralPatcher(patcherContext, tag, template) {
        var _this = _super.call(this, patcherContext) || this;
        _this.tag = tag;
        _this.template = template;
        return _this;
    }
    TaggedTemplateLiteralPatcher.prototype.patchAsExpression = function () {
        this.tag.patch();
        this.template.patch({ forceTemplateLiteral: true });
    };
    return TaggedTemplateLiteralPatcher;
}(NodePatcher));
export default TaggedTemplateLiteralPatcher;
