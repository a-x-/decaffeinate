import { PatchOptions } from '../../../patchers/types';
import InterpolatedPatcher from './InterpolatedPatcher';
/**
 * Patcher to handle all types of strings, whether or not they have
 * interpolations and whether or not they are multiline.
 */
export default class StringPatcher extends InterpolatedPatcher {
    patchAsExpression({ forceTemplateLiteral }?: PatchOptions): void;
    shouldBecomeTemplateLiteral(): boolean;
}
