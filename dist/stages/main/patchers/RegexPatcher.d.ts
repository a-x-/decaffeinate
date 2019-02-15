import { Regex } from 'decaffeinate-parser/dist/nodes';
import NodePatcher from '../../../patchers/NodePatcher';
export default class RegexPatcher extends NodePatcher {
    node: Regex;
    patchAsExpression(): void;
}
