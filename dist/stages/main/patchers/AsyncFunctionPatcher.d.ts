import FunctionPatcher from './FunctionPatcher';
export default class AsyncFunctionPatcher extends FunctionPatcher {
    patchFunctionStart({ method }: {
        method: boolean;
    }): void;
}
