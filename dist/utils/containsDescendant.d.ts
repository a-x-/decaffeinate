import { Node } from 'decaffeinate-parser/dist/nodes';
export default function containsDescendant(node: Node, predicate: (node: Node) => boolean, { shouldStopTraversal }?: {
    shouldStopTraversal?: (node: Node) => boolean;
}): boolean;
