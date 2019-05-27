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

import * as stringExtensions from "./../src/stringExtensions";

describe("stringExtensions", () => {
    describe("format", () => {
        it("should return the original value if the value if empty string", () => {
            const expectedValue: string = "";

            const actualValue: string = stringExtensions.format(expectedValue);

            expect(actualValue).toBe(expectedValue);
        });
    });

    describe("equalIgnoreCase", () => {
        it("should return true if strings are the same", () => {
            const firstString: string = "PoWeR bI",
                secondString: string = "pOwEr Bi";

            const actualResult: boolean = stringExtensions.equalIgnoreCase(
                firstString,
                secondString);

            expect(actualResult).toBeTruthy();
        });
    });

    describe("stringToArrayBuffer", () => {
        it("should return null if the given string is empty", () => {
            const expectedBuffer: ArrayBuffer = null,
                str: string = "";

            const actualBuffer: any = stringExtensions.stringToArrayBuffer(str);

            expect(actualBuffer).toBe(expectedBuffer);
        });

        it("should contain the correct amount of letters", () => {
            const str: string = "Power BI",
                expectedAmountOfLetters: number = str.length;

            const actualBuffer: any = stringExtensions.stringToArrayBuffer(str);

            expect(actualBuffer.byteLength).toBe(expectedAmountOfLetters);
        });
    });

    describe("containsWhitespace", () => {
        it("should return true if the string contains white spaces", () => {
            const str: string = "Power BI";

            const actualResult: boolean = stringExtensions.containsWhitespace(str);

            expect(actualResult).toBeTruthy();
        });
    });

    describe("trimTrailingWhitespace", () => {
        it("should remove the last white spaces of the string", () => {
            const str: string = "Power BI  ",
                expectedValue: string = "Power BI";

            const actualValue: string = stringExtensions.trimTrailingWhitespace(str);

            expect(actualValue).toBe(expectedValue);
        });
    });

    describe("isWhitespace", () => {
        it("should return false if string contains other letter excepting white spaces", () => {
            const str: string = " Power BI ";

            const actualResult: boolean = stringExtensions.isWhitespace(str);

            expect(actualResult).toBeFalsy();
        });
    });

    describe("trimWhitespace", () => {
        it("should remove white spaces at the beginning and ending of the string", () => {
            const str: string = " Power BI ",
                expectedValue: string = "Power BI";

            const actualResult: string = stringExtensions.trimWhitespace(str);

            expect(actualResult).toBe(expectedValue);
        });
    });

    describe("getLengthDifference", () => {
        it("should return the correct diff", () => {
            const firstString: string = "Integer viverra nibh at tempus pretium. ",
                secondString: string = "Nulla suscipit justo mauris, et varius metus gravida ac. Curabitur mattis",
                expectedDiff: number = secondString.length - firstString.length;

            const actualDiff: number = stringExtensions.getLengthDifference(
                firstString,
                secondString);

            expect(actualDiff).toBe(expectedDiff);
        });
    });

    describe("replaceAll", () => {
        it("should return the original string if the textToFind is undefined", () => {
            const expectedValue: string = "Power BI";

            const actualValue: string = stringExtensions.replaceAll(
                expectedValue,
                undefined,
                undefined);

            expect(actualValue).toBe(expectedValue);
        });

        it("should replace every instance of the substring", () => {
            const str: string = "Power BI Power BI Power BI",
                textToFind: string = "Power",
                textToReplace: string = "Microsoft Power",
                expectedValue: string = "Microsoft Power BI Microsoft Power BI Microsoft Power BI";

            const actualValue: string = stringExtensions.replaceAll(
                str,
                textToFind,
                textToReplace);

            expect(actualValue).toBe(expectedValue);
        });
    });

    describe("findUniqueName", () => {
        it("should return an unique name", () => {
            const baseName: string = "Power BI",
                expectedValue: string = `${baseName}2`,
                usedNamed: any = {
                    [baseName]: true,
                    [`${baseName}4`]: true,
                    [`${baseName}1`]: true,
                    [`${baseName}0`]: true
                };

            const actualValue: string = stringExtensions.findUniqueName(
                usedNamed,
                baseName);

            expect(actualValue).toBe(expectedValue);
        });
    });

    describe("stripTagDelimiters", () => {
        it("should return brackets of the tag", () => {
            const strWithTag: string = "<header><p>Power BI</p></header>",
                expectedValue: string = "headerpPower BI/p/header";

            const actualValue: string = stringExtensions.stripTagDelimiters(strWithTag);

            expect(actualValue).toBe(expectedValue);
        });
    });

    describe("constructNameFromList", () => {
        it("not exceeding max value", () => {
            const result: string = stringExtensions.constructNameFromList([
                "FirstName",
                "SecondName"
            ], "&", 50);

            expect(result).toBe("FirstName & SecondName");
        });

        it("exceeding max value", () => {
            const result: string = stringExtensions.constructNameFromList([
                "The first category name",
                "The second category name",
                "The third category name"
            ], "&", 50);

            expect(result).toBe("The first category name & The second category name & ...");
        });
    });

    describe("startsWith", () => {
        it("positive test", () => {
            const result: boolean = stringExtensions.startsWith("abcdefg", "abcd");

            expect(result).toBe(true);
        });

        it("negative test", () => {
            const result: boolean = stringExtensions.startsWith("abcdefg", "gfe");

            expect(result).toBe(false);
        });

        it("case sensitivity test", () => {
            const result: boolean = stringExtensions.startsWith("abcdefg", "abC");

            expect(result).toBe(false);
        });
    });

    describe("ensureUniqueNames", () => {
        it("basic", () => {
            const result: string[] = stringExtensions.ensureUniqueNames(["a", "b"]);

            expect(result[0]).toBe("a");
            expect(result[1]).toBe("b");
        });

        it("simple repeat", () => {
            const result: string[] = stringExtensions.ensureUniqueNames([
                "a",
                "a",
                "f",
                "a"
            ]);

            expect(result[0]).toBe("a");
            expect(result[1]).toBe("a.1");
            expect(result[2]).toBe("f");
            expect(result[3]).toBe("a.2");
        });

        it("original name kept regardless of order", () => {
            const result: string[] = stringExtensions.ensureUniqueNames([
                "a",
                "a",
                "a",
                "a.2",
                "a.2"
            ]);

            expect(result[0]).toBe("a");
            expect(result[1]).toBe("a.1");
            expect(result[2]).toBe("a.3");
            expect(result[3]).toBe("a.2");
            expect(result[4]).toBe("a.2.1");
        });
    });

    describe("normalizeFileName", () => {
        it("string with quote", () => {
            expect(stringExtensions.normalizeFileName(`Hello"World`))
                .toEqual("HelloWorld");
        });

        it("string with all reserved characters", () => {
            expect(stringExtensions.normalizeFileName("<>:\"/\\|?*"))
                .toEqual("");
        });
    });

    it("stringyAsPrettyJSON", () => {
        const testObj: any = {
            name: "foo",
            subs: [
                { name: "bar" },
                { name: "baz" }
            ]
        };

        expect(stringExtensions.stringifyAsPrettyJSON(testObj))
            .toEqual(`{"name":"foo","subs":[{"name":"bar"},{"name":"baz"}]}`);
    });

    describe("deriveClsCompliantName", () => {
        it("valid input unchanged", () => {
            const input: string = "valid";

            expect(stringExtensions.deriveClsCompliantName(input, "fallback")).toBe(input);
        });

        it("fallback returned if input string is invalid", () => {
            const input: string = "!!!",
                fallback: string = "fallback";

            expect(stringExtensions.deriveClsCompliantName(input, fallback)).toBe(fallback);
        });

        it("leading nonalpha characters removed", () => {
            const input: string = "123!@#$%^&*()-_abc123";

            expect(stringExtensions.deriveClsCompliantName(input, "fallback")).toBe("abc123");
        });

        it("non-leading non-CLS non-unicode separators transformed to underscore", () => {
            const input: string = "abc./\\- :123";

            expect(stringExtensions.deriveClsCompliantName(input, "fallback")).toBe("abc______123");
        });

        it("non-leading non-CLS unicode separators transformed to underscore", () => {
            const unicodeInput: string = "abc\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000123";

            expect(stringExtensions.deriveClsCompliantName(unicodeInput, "fallback"))
                .toBe("abc___________________123");
        });

        it("non-CLS non-separator characters removed", () => {
            const unicodeInput: string = "abc!@#$%^&*()123";

            expect(stringExtensions.deriveClsCompliantName(unicodeInput, "fallback"))
                .toBe("abc123");
        });
    });

    it("contains", () => {
        expect(stringExtensions.contains("work it harder", "work")).toBe(true, "start");
        expect(stringExtensions.contains("work it harder", "it")).toBe(true, "middle");
        expect(stringExtensions.contains("work it harder", "harder")).toBe(true, "end");
        expect(stringExtensions.contains("work it harder", "work it")).toBe(true, "with space");

        expect(stringExtensions.contains("harder", "work it harder")).toBe(false);

        expect(stringExtensions.contains("work it harder", "HARDER")).toBe(false, "lower-case vs. upper-case");
        expect(stringExtensions.contains("WORK IT HARDER", "harder")).toBe(false, "upper-case vs. lower-case");

        expect(stringExtensions.contains(null, "null")).toBe(false, "null source");
        expect(stringExtensions.contains(undefined, "undefined")).toBe(false, "null source");
        expect(stringExtensions.contains("", "empty")).toBe(false, "empty source");
        expect(stringExtensions.contains("non-empty", "")).toBe(true, "empty substring");
    });

    it("containsIgnoreCase", () => {
        expect(stringExtensions.containsIgnoreCase("make it better", "make")).toBe(true, "start");
        expect(stringExtensions.containsIgnoreCase("make it better", "it")).toBe(true, "middle");
        expect(stringExtensions.containsIgnoreCase("make it better", "better")).toBe(true, "start");
        expect(stringExtensions.containsIgnoreCase("make it better", "make it")).toBe(true, "with space");

        expect(stringExtensions.containsIgnoreCase("better", "make it better")).toBe(false);

        expect(stringExtensions.containsIgnoreCase("make it better", "MAKE")).toBe(true, "start, lower-case vs. upper-case");
        expect(stringExtensions.containsIgnoreCase("make it better", "IT")).toBe(true, "middle, lower-case vs. upper-case");
        expect(stringExtensions.containsIgnoreCase("make it better", "BETTER")).toBe(true, "end, lower-case vs. upper-case");
        expect(stringExtensions.containsIgnoreCase("MAKE IT BETTER", "make it")).toBe(true, "with space, upper-case vs. lower-case");

        expect(stringExtensions.containsIgnoreCase(null, "null")).toBe(false, "null source");
        expect(stringExtensions.containsIgnoreCase(undefined, "undefined")).toBe(false, "null source");
        expect(stringExtensions.containsIgnoreCase("", "empty")).toBe(false, "empty string source");
        expect(stringExtensions.containsIgnoreCase("non-empty", "")).toBe(true, "empty substring");
    });
});
