import SourceToken from 'coffee-lex/dist/SourceToken';
import NodePatcher from './../../../patchers/NodePatcher';
import { EarlySuperTransformInfo } from './AssignOpPatcher';
export default class SuperPatcher extends NodePatcher {
    patchAsExpression(): void;
    /**
     * When dynamically defining a static method on a class, we need to handle any
     * super calls in the normalize stage. Otherwise, the code will move into an
     * initClass method and super calls will refer to super.initClass.
     */
    patchEarlySuperTransform({ classCode, accessCode }: EarlySuperTransformInfo): void;
    getEarlyTransformInfo(): EarlySuperTransformInfo | null;
    getFollowingOpenParenToken(): SourceToken;
}
