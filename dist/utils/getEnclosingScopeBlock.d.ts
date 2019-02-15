import NodePatcher from '../patchers/NodePatcher';
import BlockPatcher from '../stages/main/patchers/BlockPatcher';
/**
 * For main stage nodes, find the block corresponding to this node's scope.
 */
export default function getEnclosingScopeBlock(patcher: NodePatcher): BlockPatcher;
