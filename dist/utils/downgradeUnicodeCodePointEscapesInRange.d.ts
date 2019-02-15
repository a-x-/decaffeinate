import NodePatcher from '../patchers/NodePatcher';
/**
 * Normal JS regular expressions don't support unicode code point escapes (e.g. /\u{1a}/), so
 * CoffeeScript compiles them to normal unicode escapes /\u001a/. Note that regexes now support the
 * "u" flag that makes them support unicode code point escapes and changes a few other aspects of
 * their behavior, but CoffeeScript still keeps the old behavior and just compiles the code point to
 * normal unicode escapes when the "u" flag is missing.
 *
 * needsExtraEscape is for heregexes where we'll need two backslashes before each 'u'. The first one
 * will be handled automatically by later code, but the second one we need to insert here.
 */
export default function downgradeUnicodeCodePointEscapesInRange(start: number, end: number, patcher: NodePatcher, { needsExtraEscape }?: {
    needsExtraEscape?: boolean;
}): void;
