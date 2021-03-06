import FunctionPatcher from './FunctionPatcher';
/**
 * Handles generator functions, i.e. produced by embedding `yield` statements.
 */
export default class GeneratorFunctionPatcher extends FunctionPatcher {
    patchFunctionStart({ method }: {
        method: boolean;
    }): void;
}
