import getIndent from '../utils/getIndent';
import getFreeBinding from '../utils/getFreeBinding';
import isSafeToRepeat from '../utils/isSafeToRepeat';
import stripSharedIndent from '../utils/stripSharedIndent';

const MAX_RANGE_LITERAL_VALUES = 20;

/**
 * Patches ranges.
 *
 * @param {Object} node
 * @param {MagicString} patcher
 */
export default function preprocessRange(node, patcher) {
  if (node.type === 'Range') {
    const resultBinding = getFreeBinding(node.scope, 'result');
    const iBinding = getFreeBinding(node.scope, 'i');
    const { left, right } = node;

    if (left.type === 'Int' && right.type === 'Int') {
      const isAscending = left.data <= right.data;
      const lastValue = node.isInclusive ? right.data : right.data + (isAscending ? -1 : 1);
      if (Math.abs(lastValue - left.data) <= MAX_RANGE_LITERAL_VALUES) {
        let numbers = [];
        if (isAscending) {
          for (let i = left.data; i <= lastValue; i++) {
            numbers.push(i);
          }
        } else {
          for (let i = left.data; i >= lastValue; i--) {
            numbers.push(i);
          }
        }
        patcher.overwrite(left.range[0], right.range[1], numbers.join(', '));
        return true;
      } else {
        const indent = getIndent(patcher.original, node.range[0]);
        patcher.overwrite(
          node.range[0],
          node.range[1],
          stripSharedIndent(`
            (do ->
              ${indent}${resultBinding} = []
              ${indent}${iBinding} = ${left.raw}
              ${indent}while ${iBinding} ${isAscending ? (node.isInclusive ? '<=' : '<') : (node.isInclusive ? '>=' : '>')} ${right.raw}
              ${indent}  ${resultBinding}.push(${iBinding}${isAscending ? '++' : '--'})
              ${indent}${resultBinding})
          `)
        );
        return true;
      }
    }

    const indent = `  ${getIndent(patcher.original, node.range[0])}`;
    const isStartSafeToRepeat = isSafeToRepeat(left);
    const isEndSafeToRepeat = isSafeToRepeat(right);
    const start = isStartSafeToRepeat ? left.raw : getFreeBinding(node.scope, 'start');
    const end = isEndSafeToRepeat ? right.raw : getFreeBinding(node.scope, 'end');

    let lines = [];

    lines.push(`${resultBinding} = []`);
    if (!isStartSafeToRepeat) {
      lines.push(`${start} = ${left.raw}`);
    }
    if (!isEndSafeToRepeat) {
      lines.push(`${end} = ${right.raw}`);
    }
    lines.push(
      `${iBinding} = ${start}`,
      `if ${start} <= ${end}`,
      `  while ${iBinding} ${node.isInclusive ? '<=' : '<'} ${end}`,
      `    ${resultBinding}.push(${iBinding}++)`,
      `else`,
      `  while ${iBinding} ${node.isInclusive ? '>=' : '>'} ${end}`,
      `    ${resultBinding}.push(${iBinding}--)`,
      `${resultBinding}`
    );

    patcher.overwrite(
      node.range[0],
      node.range[1],
      `(do ->\n${lines.map(line => indent + line).join('\n')})`
    );
    return true;
  }
}