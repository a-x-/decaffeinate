export default function formatCoffeeScriptLocationData(locationData, context) {
    var first_line = locationData.first_line, first_column = locationData.first_column, last_line = locationData.last_line, last_column = locationData.last_column;
    var firstIndex = context.linesAndColumns.indexForLocation({ line: first_line, column: first_column });
    if (firstIndex === null) {
        return 'INVALID RANGE';
    }
    var lastIndex = context.linesAndColumns.indexForLocation({ line: last_line, column: last_column });
    if (lastIndex === null) {
        return 'INVALID RANGE';
    }
    return context.formatRange(firstIndex, lastIndex + 1);
}
