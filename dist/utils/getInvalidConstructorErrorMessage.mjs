import stripSharedIndent from './stripSharedIndent';
export default function getInvalidConstructorErrorMessage(firstSentence) {
    return stripSharedIndent("\n    " + firstSentence + "\n    \n    JavaScript requires all subclass constructors to call `super` and to do so\n    before the first use of `this`, so the following cases cannot be converted\n    automatically:\n    * Constructors in subclasses that use `this` before `super`.\n    * Constructors in subclasses that omit the `super` call.\n    * Subclasses that use `=>` method syntax to automatically bind methods.\n    \n    To convert these cases to JavaScript anyway, remove the option\n    --disallow-invalid-constructors when running decaffeinate.\n  ");
}
