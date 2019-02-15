import ReturnPatcher from './ReturnPatcher';
export default class AwaitReturnPatcher extends ReturnPatcher {
    initialize(): void;
    patchAsStatement(): void;
}
