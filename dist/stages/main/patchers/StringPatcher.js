"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var ExportAllDeclarationPatcher_1 = require("./ExportAllDeclarationPatcher");
var ExportBindingsDeclarationPatcher_1 = require("./ExportBindingsDeclarationPatcher");
var ImportDeclarationPatcher_1 = require("./ImportDeclarationPatcher");
var InterpolatedPatcher_1 = require("./InterpolatedPatcher");
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
        else if (openQuoteToken.type === coffee_lex_1.SourceType.TSSTRING_START) {
            escapeStrings.push("'");
            this.overwrite(openQuoteToken.start, openQuoteToken.end, "'");
            this.overwrite(closeQuoteToken.start, closeQuoteToken.end, "'");
        }
        else if (openQuoteToken.type === coffee_lex_1.SourceType.TDSTRING_START) {
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
        if ((this.parent instanceof ImportDeclarationPatcher_1.default ||
            this.parent instanceof ExportAllDeclarationPatcher_1.default ||
            this.parent instanceof ExportBindingsDeclarationPatcher_1.default) &&
            this.parent.source === this) {
            // Import sources should never be template literals.
            return false;
        }
        return this.expressions.length > 0 || this.node.raw.indexOf('\n') > -1;
    };
    return StringPatcher;
}(InterpolatedPatcher_1.default));
exports.default = StringPatcher;
