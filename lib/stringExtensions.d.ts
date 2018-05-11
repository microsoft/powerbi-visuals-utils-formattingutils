/**
 * Checks if a string ends with a sub-string.
 */
export declare function endsWith(str: string, suffix: string): boolean;
export declare function format(...args: string[]): string;
/**
 * Compares two strings for equality, ignoring case.
 */
export declare function equalIgnoreCase(a: string, b: string): boolean;
export declare function startsWithIgnoreCase(a: string, b: string): boolean;
export declare function startsWith(a: string, b: string): boolean;
/** Determines whether a string contains a specified substring (by case-sensitive comparison). */
export declare function contains(source: string, substring: string): boolean;
/** Determines whether a string contains a specified substring (while ignoring case). */
export declare function containsIgnoreCase(source: string, substring: string): boolean;
/**
 * Normalizes case for a string.
 * Used by equalIgnoreCase method.
 */
export declare function normalizeCase(value: string): string;
/**
 * Receives a string and returns an ArrayBuffer of its characters.
 * @return An ArrayBuffer of the string's characters.
 * If the string is empty or null or undefined - returns null.
 */
export declare function stringToArrayBuffer(str: string): Uint8Array;
/**
 * Is string null or empty or undefined?
 * @return True if the value is null or undefined or empty string,
 * otherwise false.
 */
export declare function isNullOrEmpty(value: string): boolean;
/**
 * Returns true if the string is null, undefined, empty, or only includes white spaces.
 * @return True if the str is null, undefined, empty, or only includes white spaces,
 * otherwise false.
 */
export declare function isNullOrUndefinedOrWhiteSpaceString(str: string): boolean;
/**
 * Returns a value indicating whether the str contains any whitespace.
 */
export declare function containsWhitespace(str: string): boolean;
/**
 * Returns a value indicating whether the str is a whitespace string.
 */
export declare function isWhitespace(str: string): boolean;
/**
 * Returns the string with any trailing whitespace from str removed.
 */
export declare function trimTrailingWhitespace(str: string): string;
/**
 * Returns the string with any leading and trailing whitespace from str removed.
 */
export declare function trimWhitespace(str: string): string;
/**
 * Returns length difference between the two provided strings.
 */
export declare function getLengthDifference(left: string, right: string): number;
/**
 * Repeat char or string several times.
 * @param char The string to repeat.
 * @param count How many times to repeat the string.
 */
export declare function repeat(char: string, count: number): string;
/**
 * Replace all the occurrences of the textToFind in the text with the textToReplace.
 * @param text The original string.
 * @param textToFind Text to find in the original string.
 * @param textToReplace New text replacing the textToFind.
 */
export declare function replaceAll(text: string, textToFind: string, textToReplace: string): string;
export declare function ensureUniqueNames(names: string[]): string[];
/**
 * Returns a name that is not specified in the values.
 */
export declare function findUniqueName(usedNames: {
    [name: string]: boolean;
}, baseName: string): string;
export declare function constructNameFromList(list: string[], separator: string, maxCharacter: number): string;
export declare function escapeStringForRegex(s: string): string;
/**
 * Remove file name reserved characters <>:"/\|?* from input string.
 */
export declare function normalizeFileName(fileName: string): string;
/**
 * Similar to JSON.stringify, but strips away escape sequences so that the resulting
 * string is human-readable (and parsable by JSON formatting/validating tools).
 */
export declare function stringifyAsPrettyJSON(object: any): string;
/**
 * Derive a CLS-compliant name from a specified string.  If no allowed characters are present, return a fallback string instead.
 * TODO (6708134): this should have a fully Unicode-aware implementation
 */
export declare function deriveClsCompliantName(input: string, fallback: string): string;
/** Performs cheap sanitization by stripping away HTML tag (<>) characters. */
export declare function stripTagDelimiters(s: string): string;
