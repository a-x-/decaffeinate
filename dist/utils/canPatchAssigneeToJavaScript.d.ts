/**
 * Determine if the given assignee (array destructure, object destructure, rest,
 * etc.) can be translated to JavaScript directly. If not, we'll need to expand
 * the assignee into repeated assignments.
 *
 * Notably, we cannot patch default values (assignment operations) to JavaScript
 * since CS falls back to the default if the value is undefined or null, while
 * JS falls back to the default if the value only if the value is undefined.
 */
import { Node } from 'decaffeinate-parser/dist/nodes';
import { Options } from '../options';
export default function canPatchAssigneeToJavaScript(node: Node, options: Options, isTopLevel?: boolean): boolean;
