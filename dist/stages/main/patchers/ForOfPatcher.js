"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var coffee_lex_1 = require("coffee-lex");
var suggestions_1 = require("../../../suggestions");
var notNull_1 = require("../../../utils/notNull");
var ForPatcher_1 = require("./ForPatcher");
var ForOfPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ForOfPatcher, _super);
    function ForOfPatcher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ForOfPatcher.prototype.patchAsStatement = function () {
        if (this.body && !this.body.inline()) {
            this.body.setIndent(this.getLoopBodyIndent());
        }
        var keyAssignee = this.keyAssignee;
        // Save the filter code and remove if it it's there.
        this.getFilterCode();
        if (this.filter) {
            this.remove(this.target.outerEnd, this.filter.outerEnd);
        }
        this.removeOwnTokenIfExists();
        var shouldExtractTarget = this.requiresExtractingTarget();
        if (shouldExtractTarget) {
            this.insert(this.innerStart, this.getTargetReference() + " = " + this.getTargetCode() + "\n" + this.getLoopIndent());
        }
        var keyBinding = this.getIndexBinding();
        this.insert(keyAssignee.outerStart, '(');
        // Overwrite key assignee in case it was something like @key.
        this.overwrite(this.keyAssignee.contentStart, this.keyAssignee.contentEnd, keyBinding);
        // Patch the target. Also get a reference in case we need it.
        var targetReference = this.getTargetReference();
        var valAssignee = this.valAssignee;
        var valueAssignment = null;
        if (valAssignee) {
            valAssignee.patch();
            var valAssigneeString = this.slice(valAssignee.contentStart, valAssignee.contentEnd);
            // `for (k, v of o` → `for (k of o`
            //        ^^^
            this.remove(keyAssignee.outerEnd, valAssignee.outerEnd);
            valueAssignment = valAssigneeString + " = " + this.getTargetReference() + "[" + keyBinding + "]";
            if (valAssignee.statementNeedsParens()) {
                valueAssignment = "(" + valueAssignment + ")";
            }
        }
        var relationToken = this.getRelationToken();
        if (this.node.isOwn) {
            this.addSuggestion(suggestions_1.CLEAN_UP_FOR_OWN_LOOPS);
            if (shouldExtractTarget) {
                this.overwrite(relationToken.end, this.target.outerEnd, " Object.keys(" + targetReference + " || {})) {");
            }
            else {
                // `for (k of o` → `for (k of Object.keys(o`
                //                            ^^^^^^^^^^^^
                this.insert(this.target.outerStart, 'Object.keys(');
                // `for (k of Object.keys(o` → `for (k of Object.keys(o || {})) {`
                //                                                     ^^^^^^^^^^
                this.insert(this.target.outerEnd, ' || {})) {');
            }
        }
        else {
            if (shouldExtractTarget) {
                this.overwrite(relationToken.start, this.target.outerEnd, "in " + targetReference + ") {");
            }
            else {
                // `for (k of o` → `for (k in o`
                //         ^^              ^^
                this.overwrite(relationToken.start, relationToken.end, 'in');
                // `for (k in o` → `for (k in o) {`
                //                             ^^^
                this.insert(this.target.outerEnd, ') {');
            }
        }
        this.removeThenToken();
        this.patchPossibleNewlineAfterLoopHeader(this.target.outerEnd);
        if (valueAssignment !== null && this.body !== null) {
            this.body.insertLineBefore(valueAssignment, this.getOuterLoopBodyIndent());
        }
        this.patchBodyAndFilter();
    };
    ForOfPatcher.prototype.removeOwnTokenIfExists = function () {
        if (this.node.isOwn) {
            var ownIndex = this.indexOfSourceTokenAfterSourceTokenIndex(this.contentStartTokenIndex, coffee_lex_1.SourceType.OWN);
            if (!ownIndex) {
                throw this.error('Expected to find own token in for-own.');
            }
            var ownToken = notNull_1.default(this.sourceTokenAtIndex(ownIndex));
            this.remove(ownToken.start, this.keyAssignee.outerStart);
        }
    };
    ForOfPatcher.prototype.requiresExtractingTarget = function () {
        return !this.target.isRepeatable() && this.valAssignee !== null;
    };
    ForOfPatcher.prototype.targetBindingCandidate = function () {
        return 'object';
    };
    ForOfPatcher.prototype.indexBindingCandidates = function () {
        return ['key'];
    };
    ForOfPatcher.prototype.willPatchAsIIFE = function () {
        return this.willPatchAsExpression();
    };
    return ForOfPatcher;
}(ForPatcher_1.default));
exports.default = ForOfPatcher;
