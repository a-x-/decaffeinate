import * as tslib_1 from "tslib";
import { SourceType } from 'coffee-lex';
import getAssigneeBindings from '../../../utils/getAssigneeBindings';
import notNull from '../../../utils/notNull';
import IdentifierPatcher from './IdentifierPatcher';
import LoopPatcher from './LoopPatcher';
import MemberAccessOpPatcher from './MemberAccessOpPatcher';
var ForPatcher = /** @class */ (function (_super) {
    tslib_1.__extends(ForPatcher, _super);
    function ForPatcher(patcherContext, keyAssignee, valAssignee, target, filter, body) {
        var _this = _super.call(this, patcherContext, body) || this;
        _this._filterCode = null;
        _this._targetCode = null;
        _this._indexBinding = null;
        _this._targetReference = null;
        _this.keyAssignee = keyAssignee;
        _this.valAssignee = valAssignee;
        _this.target = target;
        _this.filter = filter;
        return _this;
    }
    ForPatcher.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        if (this.keyAssignee) {
            this.keyAssignee.setAssignee();
            this.keyAssignee.setRequiresExpression();
        }
        if (this.valAssignee) {
            this.valAssignee.setAssignee();
            this.valAssignee.setRequiresExpression();
        }
        this.target.setRequiresExpression();
        if (this.filter) {
            this.filter.setRequiresExpression();
        }
    };
    /**
     * Called by the BlockPatcher for the enclosing scope to know which
     * assignments may need declarations at the start of the block.
     */
    ForPatcher.prototype.getIIFEAssignments = function () {
        if (this.willPatchAsIIFE()) {
            var iifeAssignments = [];
            if (this.keyAssignee) {
                iifeAssignments.push.apply(iifeAssignments, tslib_1.__spread(getAssigneeBindings(this.keyAssignee.node)));
            }
            if (this.valAssignee) {
                iifeAssignments.push.apply(iifeAssignments, tslib_1.__spread(getAssigneeBindings(this.valAssignee.node)));
            }
            return iifeAssignments;
        }
        else {
            return [];
        }
    };
    ForPatcher.prototype.getFilterCode = function () {
        var filter = this.filter;
        if (!filter) {
            return null;
        }
        if (!this._filterCode) {
            this._filterCode = filter.patchAndGetCode({ needsParens: false });
        }
        return this._filterCode;
    };
    ForPatcher.prototype.getLoopBodyIndent = function () {
        if (this.filter) {
            return this.getOuterLoopBodyIndent() + this.getProgramIndentString();
        }
        else {
            return this.getOuterLoopBodyIndent();
        }
    };
    ForPatcher.prototype.patchBodyAndFilter = function () {
        if (this.body) {
            if (this.filter) {
                this.body.insertLineBefore("if (" + this.getFilterCode() + ") {", this.getOuterLoopBodyIndent());
                this.patchBody();
                this.body.insertLineAfter('}', this.getOuterLoopBodyIndent());
                this.body.insertLineAfter('}', this.getLoopIndent());
            }
            else {
                this.patchBody();
                this.body.insertLineAfter('}', this.getLoopIndent());
            }
        }
        else {
            if (this.filter) {
                this.insert(this.contentEnd, "if (" + this.getFilterCode() + ") {} }");
            }
            else {
                this.insert(this.contentEnd, "}");
            }
        }
    };
    ForPatcher.prototype.getRelationToken = function () {
        var searchStart = -1;
        if (this.keyAssignee) {
            searchStart = Math.max(this.keyAssignee.outerEnd);
        }
        if (this.valAssignee) {
            searchStart = Math.max(this.valAssignee.outerEnd);
        }
        if (searchStart === -1) {
            throw this.error('Expected to find a good starting point to search for relation token.');
        }
        var tokenIndex = this.indexOfSourceTokenBetweenSourceIndicesMatching(searchStart, this.target.outerStart, 
        // "of" and "in" are relation tokens, but "from" is a plain identifier.
        function (token) { return token.type === SourceType.RELATION || token.type === SourceType.IDENTIFIER; });
        if (!tokenIndex) {
            throw this.error("cannot find relation keyword in 'for' loop");
        }
        return notNull(this.sourceTokenAtIndex(tokenIndex));
    };
    /**
     * @protected
     */
    ForPatcher.prototype.getIndexBinding = function () {
        if (!this._indexBinding) {
            this._indexBinding = this.computeIndexBinding();
        }
        return this._indexBinding;
    };
    /**
     * @protected
     */
    ForPatcher.prototype.computeIndexBinding = function () {
        var keyAssignee = this.keyAssignee;
        if (keyAssignee) {
            if (keyAssignee instanceof MemberAccessOpPatcher) {
                return "this." + keyAssignee.member.node.data;
            }
            else if (keyAssignee instanceof IdentifierPatcher) {
                return this.slice(keyAssignee.contentStart, keyAssignee.contentEnd);
            }
            else {
                // CoffeeScript requires that the index be an identifier or this-assignment, not a pattern
                // matching expression, so this should never happen.
                throw keyAssignee.error("expected loop index to be an identifier or this-assignment");
            }
        }
        else {
            return this.claimFreeBinding(this.indexBindingCandidates());
        }
    };
    ForPatcher.prototype.isThisAssignIndexBinding = function () {
        return this.keyAssignee instanceof MemberAccessOpPatcher;
    };
    /**
     * @protected
     */
    ForPatcher.prototype.indexBindingCandidates = function () {
        return ['i', 'j', 'k'];
    };
    /**
     * @protected
     */
    ForPatcher.prototype.removeThenToken = function () {
        var searchStart = this.getLoopHeaderEnd();
        var searchEnd;
        if (this.body) {
            searchEnd = this.body.outerStart;
        }
        else {
            var nextToken = this.nextSemanticToken();
            if (nextToken) {
                searchEnd = nextToken.end;
            }
            else {
                searchEnd = this.contentEnd;
            }
        }
        var index = this.indexOfSourceTokenBetweenSourceIndicesMatching(searchStart, searchEnd, function (token) { return token.type === SourceType.THEN; });
        if (index) {
            var thenToken = notNull(this.sourceTokenAtIndex(index));
            var nextIndex = index.next();
            var nextToken = nextIndex && this.sourceTokenAtIndex(nextIndex);
            if (nextToken) {
                this.remove(thenToken.start, nextToken.start);
            }
            else {
                this.remove(thenToken.start, thenToken.end);
            }
        }
    };
    /**
     * Get the last known index of the loop header, just before the `then` token
     * or the body. This can be overridden to account for additional loop header
     * elements.
     */
    ForPatcher.prototype.getLoopHeaderEnd = function () {
        return Math.max(this.filter ? this.filter.outerEnd : -1, this.target.outerEnd);
    };
    ForPatcher.prototype.getTargetCode = function () {
        this.computeTargetCodeIfNecessary();
        return notNull(this._targetCode);
    };
    ForPatcher.prototype.getTargetReference = function () {
        this.computeTargetCodeIfNecessary();
        return notNull(this._targetReference);
    };
    ForPatcher.prototype.computeTargetCodeIfNecessary = function () {
        if (!this._targetReference || !this._targetCode) {
            this._targetCode = this.target.patchAndGetCode();
            if (this.requiresExtractingTarget()) {
                this._targetReference = this.claimFreeBinding(this.targetBindingCandidate());
            }
            else {
                this._targetReference = this._targetCode;
            }
        }
    };
    return ForPatcher;
}(LoopPatcher));
export default ForPatcher;
