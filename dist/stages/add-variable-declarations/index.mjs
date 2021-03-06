import addVariableDeclarations from 'add-variable-declarations';
import MagicString from 'magic-string';
import { logger } from '../../utils/debug';
var AddVariableDeclarationsStage = /** @class */ (function () {
    function AddVariableDeclarationsStage() {
    }
    AddVariableDeclarationsStage.run = function (content) {
        var log = logger(this.name);
        log(content);
        var editor = new MagicString(content);
        addVariableDeclarations(content, editor);
        return {
            code: editor.toString(),
            suggestions: []
        };
    };
    return AddVariableDeclarationsStage;
}());
export default AddVariableDeclarationsStage;
