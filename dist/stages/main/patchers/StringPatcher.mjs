import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import ExportAllDeclarationPatcher from './ExportAllDeclarationPatcher';
import ExportBindingsDeclarationPatcher from './ExportBindingsDeclarationPatcher';
import ImportDeclarationPatcher from './ImportDeclarationPatcher';
import InterpolatedPatcher from './InterpolatedPatcher';
/**
 * Patcher to handle all types of strings, whether or not they have
 * interpolations and whether or not they are multiline.
 */
var StringPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(StringPatcher, _super);
    function StringPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StringPatcher.prototype.patchAsExpression = function (_a) {
        var forceTemplateLiteral = (_a === void 0 ? {} : _a).forceTemplateLiteral;
        var shouldBecomeTemplateLiteral = forceTemplateLiteral || this.shouldBecomeTemplateLiteral();
        var escapeStrings = [];
        var openQuoteToken = this.firstToken();
        var closeQuoteToken = this.lastToken();
        if (shouldBecomeTemplateLiteral) {
            escapeStrings.push('`');
            escapeStrings.push('${');
            this.overwrite(openQuoteToken.start, openQuoteToken.end, '`');
            this.overwrite(closeQuoteToken.start, closeQuoteToken.end, '`');
        }
        else if (openQuoteToken.type === SourceType.TSSTRING_START) {
            escapeStrings.push("'");
            this.overwrite(openQuoteToken.start, openQuoteToken.end, "'");
            this.overwrite(closeQuoteToken.start, closeQuoteToken.end, "'");
        }
        else if (openQuoteToken.type === SourceType.TDSTRING_START) {
            escapeStrings.push('"');
            this.overwrite(openQuoteToken.start, openQuoteToken.end, '"');
            this.overwrite(closeQuoteToken.start, closeQuoteToken.end, '"');
        }
        this.patchInterpolations();
        this.processContents();
        if (escapeStrings.length > 0) {
            this.escapeQuasis(/^\\/, escapeStrings);
        }
    };
    StringPatcher.prototype.shouldBecomeTemplateLiteral = function () {
        if ((this.parent instanceof ImportDeclarationPatcher ||
            this.parent instanceof ExportAllDeclarationPatcher ||
            this.parent instanceof ExportBindingsDeclarationPatcher) &&
            this.parent.source === this) {
            // Import sources should never be template literals.
            return false;
        }
        return this.expressions.length > 0 || this.node.raw.indexOf('\n') > -1;
    };
    return StringPatcher;
}(InterpolatedPatcher));
export default StringPatcher;
