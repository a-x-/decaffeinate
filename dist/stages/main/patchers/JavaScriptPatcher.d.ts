import NodePatcher from './../../../patchers/NodePatcher';
/**
 * Handles embedded JavaScript.
 */
export default class JavaScriptPatcher extends NodePatcher {
    /**
     * We need to strip off the backticks and also remove any escape backslashes before backticks.
     */
    patchAsExpression(): void;
}
