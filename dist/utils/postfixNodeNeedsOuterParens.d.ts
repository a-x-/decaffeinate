import NodePatcher from '../patchers/NodePatcher';
/**
 * Determine if the given postfix if/while/for needs to have parens wrapped
 * around it while it is reordered. This happens when the expression has a comma
 * after it as part of a list (function args, array initializer, or object
 * initializer). It also happens when there is a semicolon immediately
 * afterward, since without the parens the next statement would be pulled into
 * the block. It also happens when the expression is within a spread node, since
 * otherwise there are precedence issues.
 */
export default function postfixNodeNeedsOuterParens(patcher: NodePatcher): boolean;
