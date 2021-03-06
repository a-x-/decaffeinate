import SourceToken from 'coffee-lex/dist/SourceToken';
import { PatcherContext } from '../../../patchers/types';
import NodePatcher from './../../../patchers/NodePatcher';
import QuasiPatcher from './QuasiPatcher';
export default class InterpolatedPatcher extends NodePatcher {
    quasis: Array<QuasiPatcher>;
    expressions: Array<NodePatcher | null>;
    constructor(patcherContext: PatcherContext, quasis: Array<QuasiPatcher>, expressions: Array<NodePatcher>);
    initialize(): void;
    patchInterpolations(): void;
    getInterpolationStartTokenAtIndex(index: number): SourceToken;
    /**
     * Handle "padding" characters: characters like leading whitespace that should
     * be removed according to the lexing rules. In addition to STRING_PADDING
     * tokens, which indicate that the range should be removed, there are also
     * STRING_LINE_SEPARATOR tokens that indicate that the newlines should be
     * replaced with a space.
     *
     * To preserve the formatting of multiline strings a little better, newline
     * characters are escaped rather than removed.
     *
     * Also change any \u2028 and \u2029 characters we see into their unicode
     * escape form.
     */
    processContents(): void;
    shouldExcapeZeroChars(): boolean;
    shouldDowngradeUnicodeCodePointEscapes(): boolean;
    escapeQuasis(skipPattern: RegExp, escapeStrings: Array<string>): void;
    isRepeatable(): boolean;
}
