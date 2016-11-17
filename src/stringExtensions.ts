/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.utils.formatting {
    /**
     * Extensions to String class.
     */
    export module stringExtensions {
        const HtmlTagRegex = new RegExp("[<>]", "g");

        /**
         * Checks if a string ends with a sub-string.
         */
        export function endsWith(str: string, suffix: string): boolean {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        export function format(...args: string[]) {
            let s = args[0];

            if (isNullOrUndefinedOrWhiteSpaceString(s))
                return s;

            for (let i = 0; i < args.length - 1; i++) {
                let reg = new RegExp("\\{" + i + "\\}", "gm");
                s = s.replace(reg, args[i + 1]);
            }
            return s;
        }

        /**
         * Compares two strings for equality, ignoring case.
         */
        export function equalIgnoreCase(a: string, b: string): boolean {
            return stringExtensions.normalizeCase(a) === stringExtensions.normalizeCase(b);
        }

        export function startsWithIgnoreCase(a: string, b: string): boolean {
            let normalizedSearchString = stringExtensions.normalizeCase(b);
            return stringExtensions.normalizeCase(a).indexOf(normalizedSearchString) === 0;
        }

        export function startsWith(a: string, b: string): boolean {
            return a.indexOf(b) === 0;
        }

        /** Determines whether a string contains a specified substring (by case-sensitive comparison). */
        export function contains(source: string, substring: string): boolean {
            if (source == null)
                return false;

            return source.indexOf(substring) !== -1;
        }

        /** Determines whether a string contains a specified substring (while ignoring case). */
        export function containsIgnoreCase(source: string, substring: string): boolean {
            if (source == null)
                return false;

            return contains(normalizeCase(source), normalizeCase(substring));
        }

        /** 
         * Normalizes case for a string.
         * Used by equalIgnoreCase method. 
         */
        export function normalizeCase(value: string): string {
            return value.toUpperCase();
        }

        /** 
         * Receives a string and returns an ArrayBuffer of its characters. 
         * @return An ArrayBuffer of the string's characters.
         * If the string is empty or null or undefined - returns null.
         */
        export function stringToArrayBuffer(str: string): ArrayBuffer {
            if (isNullOrEmpty(str)) {
                return null;
            }
            let buffer = new ArrayBuffer(str.length);
            let bufferView = new Uint8Array(buffer);
            for (let i = 0, strLen = str.length; i < strLen; i++) {
                bufferView[i] = str.charCodeAt(i);
            }
            return bufferView;
        }

        /** 
         * Is string null or empty or undefined?
         * @return True if the value is null or undefined or empty string,
         * otherwise false.
         */
        export function isNullOrEmpty(value: string): boolean {
            return (value == null) || (value.length === 0);
        }

        /** 
         * Returns true if the string is null, undefined, empty, or only includes white spaces.
         * @return True if the str is null, undefined, empty, or only includes white spaces,
         * otherwise false.
         */
        export function isNullOrUndefinedOrWhiteSpaceString(str: string): boolean {
            return stringExtensions.isNullOrEmpty(str) || stringExtensions.isNullOrEmpty(str.trim());
        }

        /**
         * Returns a value indicating whether the str contains any whitespace.
         */
        export function containsWhitespace(str: string): boolean {
            let expr: RegExp = /\s/;
            return expr.test(str);
        }

        /**
         * Returns a value indicating whether the str is a whitespace string.
         */
        export function isWhitespace(str: string): boolean {
            return str.trim() === "";
        }

        /** 
         * Returns the string with any trailing whitespace from str removed.
         */
        export function trimTrailingWhitespace(str: string): string {
            return str.replace(/\s+$/, "");
        }

        /**
         * Returns the string with any leading and trailing whitespace from str removed.
         */
        export function trimWhitespace(str: string): string {
            return str.replace(/^\s+/, "").replace(/\s+$/, "");
        }

        /** 
         * Returns length difference between the two provided strings.
         */
        export function getLengthDifference(left: string, right: string) {
            return Math.abs(left.length - right.length);
        }

        /**
         * Repeat char or string several times.
         * @param char The string to repeat.
         * @param count How many times to repeat the string.
         */
        export function repeat(char: string, count: number): string {
            let result = "";
            for (let i = 0; i < count; i++) {
                result += char;
            }
            return result;
        }

        /**
         * Replace all the occurrences of the textToFind in the text with the textToReplace.
         * @param text The original string.
         * @param textToFind Text to find in the original string.
         * @param textToReplace New text replacing the textToFind.
         */
        export function replaceAll(text: string, textToFind: string, textToReplace: string): string {
            if (!textToFind)
                return text;

            let pattern = escapeStringForRegex(textToFind);
            return text.replace(new RegExp(pattern, "gi"), textToReplace);
        }

        export function ensureUniqueNames(names: string[]): string[] {
            let usedNames: { [name: string]: boolean } = {};

            // Make sure we are giving fair chance for all columns to stay with their original name
            // First we fill the used names map to contain all the original unique names from the list.
            for (let name of names) {
                usedNames[name] = false;
            }

            let uniqueNames: string[] = [];

            // Now we go over all names and find a unique name for each
            for (let name of names) {
                let uniqueName = name;

                // If the (original) column name is already taken lets try to find another name
                if (usedNames[uniqueName]) {
                    let counter = 0;
                    // Find a name that is not already in the map
                    while (usedNames[uniqueName] !== undefined) {
                        uniqueName = name + "." + (++counter);
                    }
                }

                uniqueNames.push(uniqueName);
                usedNames[uniqueName] = true;
            }

            return uniqueNames;
        }

        /**
         * Returns a name that is not specified in the values.
         */
        export function findUniqueName(
            usedNames: { [name: string]: boolean },
            baseName: string): string {

            // Find a unique name
            let i = 0,
                uniqueName: string = baseName;
            while (usedNames[uniqueName]) {
                uniqueName = baseName + (++i);
            }

            return uniqueName;
        }

        export function constructNameFromList(list: string[], separator: string, maxCharacter: number): string {
            let labels: string[] = [];
            let exceeded: boolean;
            let length = 0;
            for (let item of list) {
                if (length + item.length > maxCharacter && labels.length > 0) {
                    exceeded = true;
                    break;
                }
                labels.push(item);
                length += item.length;
            }

            let separatorWithSpace = " " + separator + " ";
            let name = labels.join(separatorWithSpace);

            if (exceeded)
                name += separatorWithSpace + "...";

            return name;
        }

        export function escapeStringForRegex(s: string): string {
            return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1");
        }

        /**
         * Remove file name reserved characters <>:"/\|?* from input string.
         */
        export function normalizeFileName(fileName: string): string {
            return fileName.replace(/[\<\>\:"\/\\\|\?*]/g, "");
        }

        /**
         * Similar to JSON.stringify, but strips away escape sequences so that the resulting
         * string is human-readable (and parsable by JSON formatting/validating tools).
         */
        export function stringifyAsPrettyJSON(object: any): string {
            // let specialCharacterRemover = (key: string, value: string) => value.replace(/[^\w\s]/gi, "");
            return JSON.stringify(object /*, specialCharacterRemover*/);
        }

        /**
         * Derive a CLS-compliant name from a specified string.  If no allowed characters are present, return a fallback string instead.
         * TODO (6708134): this should have a fully Unicode-aware implementation
         */
        export function deriveClsCompliantName(input: string, fallback: string): string {
            let result = input.replace(/^[^A-Za-z]*/g, "").replace(/[ :\.\/\\\-\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, "_").replace(/[\W]/g, "");

            return result.length > 0 ? result : fallback;
        }

        /** Performs cheap sanitization by stripping away HTML tag (<>) characters. */
        export function stripTagDelimiters(s: string): string {
            return s.replace(HtmlTagRegex, "");
        }
    }
}
