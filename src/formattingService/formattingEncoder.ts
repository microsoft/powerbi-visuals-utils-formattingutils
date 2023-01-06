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

// quoted and escaped literal patterns
// NOTE: the final three cases match .NET behavior

const literalPatterns: string[] = [
    "'[^']*'",      // single-quoted literal
    `"[^"]*"`,      // double-quoted literal
    "\\\\.",        // escaped character
    "'[^']*$",      // unmatched single-quote
    `"[^"]*$`,      // unmatched double-quote
    "\\\\$",        // backslash at end of string
];

const literalMatcher = new RegExp(literalPatterns.join("|"), "g");

// Unicode U+E000 - U+F8FF is a private area and so we can use the chars from the range to encode the escaped sequences
export function removeLiterals(format: string): string {
    literalMatcher.lastIndex = 0;

    // just in case consecutive non-literals have some meaning
    return format.replace(literalMatcher, "\uE100");
}

export function preserveLiterals(format: string, literals: string[]): string {
    literalMatcher.lastIndex = 0;

    for (; ; ) {
        const match = literalMatcher.exec(format);
        if (!match)
            break;

        const literal = match[0];
        const literalOffset = literalMatcher.lastIndex - literal.length;

        const token = String.fromCharCode(0xE100 + literals.length);

        literals.push(literal);

        format = format.substring(0, literalOffset) + token + format.substring(literalMatcher.lastIndex);

        // back to avoid skipping due to removed literal substring
        literalMatcher.lastIndex = literalOffset + 1;
    }

    return format;
}

export function restoreLiterals(format: string, literals: string[], quoted: boolean = true): string {
    const count = literals.length;
    for (let i = 0; i < count; i++) {
        const token = String.fromCharCode(0xE100 + i);
        let literal = literals[i];
        if (!quoted) {
            // caller wants literals to be re-inserted without escaping
            const firstChar = literal[0];
            if (firstChar === "\\" || literal.length === 1 || literal[literal.length - 1] !== firstChar) {
                // either escaped literal OR quoted literal that's missing the trailing quote
                // in either case we only remove the leading character
                literal = literal.substring(1);
            }
            else {
                // so must be a quoted literal with both starting and ending quote
                literal = literal.substring(1, literal.length - 1);
            }
        }
        format = format.replace(token, literal);
    }
    return format;
}