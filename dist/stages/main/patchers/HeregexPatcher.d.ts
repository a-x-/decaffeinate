import { Heregex } from 'decaffeinate-parser/dist/nodes';
import InterpolatedPatcher from './InterpolatedPatcher';
export default class HeregexPatcher extends InterpolatedPatcher {
    node: Heregex;
    patchAsExpression(): void;
    shouldExcapeZeroChars(): boolean;
    shouldDowngradeUnicodeCodePointEscapes(): boolean;
}
