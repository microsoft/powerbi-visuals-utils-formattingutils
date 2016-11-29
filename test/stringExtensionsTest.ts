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

/// <reference path="_references.ts" />

module powerbi.extensibility.utils.formatting.test {
    import stringExtensions = powerbi.extensibility.utils.formatting.stringExtensions;

    describe("stringExtensionsTests", () => {
        it("constructNameFromList not exceeding max value", () => {
            let result = stringExtensions.constructNameFromList(["FirstName", "SecondName"], "&", 50);

            expect(result).toBe("FirstName & SecondName");
        });

        it("constructNameFromList exceeding max value", () => {
            let result = stringExtensions.constructNameFromList(["The first category name", "The second category name", "The third category name"], "&", 50);

            expect(result).toBe("The first category name & The second category name & ...");
        });

        it("startsWith - positive test", () => {
            let result = stringExtensions.startsWith("abcdefg", "abcd");
            expect(result).toBe(true);
        });

        it("startsWith - negative test", () => {
            let result = stringExtensions.startsWith("abcdefg", "gfe");
            expect(result).toBe(false);
        });

        it("startsWith - case sensitivity test", () => {
            let result = stringExtensions.startsWith("abcdefg", "abC");
            expect(result).toBe(false);
        });

        it("ensureUniqueNames - basic", () => {
            let result = stringExtensions.ensureUniqueNames(["a", "b"]);
            expect(result[0]).toBe("a");
            expect(result[1]).toBe("b");
        });

        it("ensureUniqueNames - simple repeat", () => {
            let result = stringExtensions.ensureUniqueNames(["a", "a", "f", "a"]);
            expect(result[0]).toBe("a");
            expect(result[1]).toBe("a.1");
            expect(result[2]).toBe("f");
            expect(result[3]).toBe("a.2");
        });

        it("ensureUniqueNames - original name kept regardless of order", () => {
            let result = stringExtensions.ensureUniqueNames(["a", "a", "a", "a.2", "a.2"]);
            expect(result[0]).toBe("a");
            expect(result[1]).toBe("a.1");
            expect(result[2]).toBe("a.3");
            expect(result[3]).toBe("a.2");
            expect(result[4]).toBe("a.2.1");
        });

        it("normalizeFileName - string with quote", () => {
            expect(stringExtensions.normalizeFileName(`Hello"World`)).toEqual("HelloWorld");
        });

        it("normalizeFileName - string with all reserved characters", () => {
            expect(stringExtensions.normalizeFileName("<>:\"/\\|?*")).toEqual("");
        });

        it("stringyAsPrettyJSON", () => {
            let testObj = {
                name: "foo",
                subs: [
                    { name: "bar" },
                    { name: "baz" }]
            };

            expect(stringExtensions.stringifyAsPrettyJSON(testObj)).toEqual(`{"name":"foo","subs":[{"name":"bar"},{"name":"baz"}]}`);
        });

        it("deriveClsCompliantName - valid input unchanged", () => {
            let input = "valid";

            expect(stringExtensions.deriveClsCompliantName(input, "fallback")).toBe(input);
        });

        it("deriveClsCompliantName - fallback returned if input string is invalid", () => {
            let input = "!!!";
            let fallback = "fallback";

            expect(stringExtensions.deriveClsCompliantName(input, fallback)).toBe(fallback);
        });

        it("deriveClsCompliantName - leading nonalpha characters removed", () => {
            let input = "123!@#$%^&*()-_abc123";

            expect(stringExtensions.deriveClsCompliantName(input, "fallback")).toBe("abc123");
        });

        it("deriveClsCompliantName - non-leading non-CLS non-unicode separators transformed to underscore", () => {
            let input = "abc./\\- :123";

            expect(stringExtensions.deriveClsCompliantName(input, "fallback")).toBe("abc______123");
        });

        it("deriveClsCompliantName - non-leading non-CLS unicode separators transformed to underscore", () => {
            let unicodeInput = "abc\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000123";

            expect(stringExtensions.deriveClsCompliantName(unicodeInput, "fallback")).toBe("abc___________________123");
        });

        it("deriveClsCompliantName - non-CLS non-separator characters removed", () => {
            let unicodeInput = "abc!@#$%^&*()123";

            expect(stringExtensions.deriveClsCompliantName(unicodeInput, "fallback")).toBe("abc123");
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
}
