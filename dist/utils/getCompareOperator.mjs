export default function getCompareOperator(operator, negated) {
    switch (operator) {
        case '==':
        case 'is':
            return negated ? '!==' : '===';
        case '!=':
        case 'isnt':
            return negated ? '===' : '!==';
        case '<':
            return negated ? '>=' : '<';
        case '>':
            return negated ? '<=' : '>';
        case '<=':
            return negated ? '>' : '<=';
        case '>=':
            return negated ? '<' : '>=';
        default:
            throw new Error("unsupported equality/inequality type: " + operator);
    }
}
