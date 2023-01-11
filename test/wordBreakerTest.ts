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

import { TextProperties } from "./../src/interfaces";
import { textMeasurementService, wordBreaker } from "./../src/index";

describe("WordBreaker", () => {

    describe("finds word when", () => {
        let result: wordBreaker.WordBreakerResult;

        // Sample strings
        let one = "nobreakstoseehere";
        let content = "abcd efgh\nijkl mnop";

        function getRange(start: number, end: number): number[]{
            return Array.from(Array(end).keys()).slice(start)
        }

        function getWordBreakerResultsBetweenIndeces(content: string, start: number, end: number): wordBreaker.WordBreakerResult[] {
            return getRange(start, end).map((index) => {
                return wordBreaker.find(index, content);
            });
        }

        function areAllSame(results: wordBreaker.WordBreakerResult[]): boolean {
            const result = results[0];
            return !results.some(el => el.start !== result.start && el.end !== result.end)
        }

        function testWordBreakerBetweenIndeces(content: string, start: number, end: number): wordBreaker.WordBreakerResult {
            let results = getWordBreakerResultsBetweenIndeces(content, start, end);
            expect(areAllSame(results)).toBeTruthy();
            return results[0];
        }

        it("no breaking characters", () => {
            result = testWordBreakerBetweenIndeces(one, 0, one.length);

            expect(result).toEqual({ start: 0, end: one.length });
            expect(one.slice(result.start, result.end)).toBe(one);
        });

        it("at start of content", () => {
            result = wordBreaker.find(0, content);
            expect(content.slice(result.start, result.end)).toBe("abcd");
        });

        it("at start of line (immediately after line break)", () => {
            result = wordBreaker.find(10, content);
            expect(content.slice(result.start, result.end)).toBe("ijkl");
        });

        it("at start of word", () => {
            result = wordBreaker.find(5, content);
            expect(content.slice(result.start, result.end)).toBe("efgh");
        });

        it("inside word", () => {
            result = testWordBreakerBetweenIndeces(content, 5, 9);

            expect(result).toEqual({ start: 5, end: 9 });
            expect(content.slice(result.start, result.end)).toBe("efgh");
        });

        it("at end of word", () => {
            result = wordBreaker.find(14, content);
            expect(content.slice(result.start, result.end)).toBe("ijkl");
        });

        it("at end of line (before line break)", () => {
            result = wordBreaker.find(9, content);
            expect(content.slice(result.start, result.end)).toBe("efgh");
        });

        it("at end of content", () => {
            result = wordBreaker.find(content.length, content);
            expect(content.slice(result.start, result.end)).toBe("mnop");
        });

        it("non-alphanumeric characters", () => {
            let weird = "weird... !@#$%^&*()_+{}~`\|/;:'-=<>";
            result = testWordBreakerBetweenIndeces(weird, 9, weird.length);

            expect(result).toEqual({ start: 9, end: weird.length });
        });
    });

    describe("can detect breaker characters", () => {
        it("when content has space", () => {
            testHasBreakers(" ", true);
            testHasBreakers("a ", true);
            testHasBreakers(" a", true);
            testHasBreakers("a b", true);
        });

        it("when content has tab", () => {
            testHasBreakers("\t", true);
            testHasBreakers("a\t", true);
            testHasBreakers("\ta", true);
            testHasBreakers("a\tb", true);
        });

        it("when content has new line", () => {
            testHasBreakers("\n", true);
            testHasBreakers("a\n", true);
            testHasBreakers("\na", true);
            testHasBreakers("a\nb", true);
        });

        it("when content does not have breakers", () => {
            testHasBreakers("abc", false);
        });

        function testHasBreakers(content: string, expected: boolean): void {
            expect(wordBreaker.hasBreakers(content)).toBe(expected);
        }
    });

    describe("can count words", () => {
        let count;

        it("when no breakers", () => {
            count = wordBreaker.wordCount("abcdefg");
            expect(count).toBe(1);
        });

        describe("has two words (one breaker)", () => {
            it("with space", () => {
                count = wordBreaker.wordCount("abcd efg");
                expect(count).toBe(2);
            });

            it("with tab", () => {
                count = wordBreaker.wordCount("abcd\tefg");
                expect(count).toBe(2);
            });

            it("with new line", () => {
                count = wordBreaker.wordCount("abcd\nefg");
                expect(count).toBe(2);
            });
        });
    });

    describe("can split into words by width and breakers", () => {
        let words;
        let textWidthMeasurer = textMeasurementService.measureSvgTextWidth;
        let textProperties: TextProperties = {
            fontFamily: "Arial",
            fontSize: "10px"
        };

        it("when no breakers", () => {
            let content = "abcdefg";
            words = wordBreaker.splitByWidth(content, textProperties, textWidthMeasurer, 25, 1);

            expect(words.length).toBe(1);
            expect(words[0]).toBe(content);
        });

        describe("has two words (one breaker)", () => {
            it("with space", () => {
                words = wordBreaker.splitByWidth("abcd efg", textProperties, textWidthMeasurer, 25, 2);

                expect(words.length).toBe(2);
                expect(words[0]).toBe("abcd");
                expect(words[1]).toBe("efg");
            });

            it("with tab", () => {
                words = wordBreaker.splitByWidth("abcd\tefg", textProperties, textWidthMeasurer, 25, 2);

                expect(words.length).toBe(2);
                expect(words[0]).toBe("abcd");
                expect(words[1]).toBe("efg");
            });

            it("with new line", () => {
                words = wordBreaker.splitByWidth("abcd\nefg", textProperties, textWidthMeasurer, 25, 2);

                expect(words.length).toBe(2);
                expect(words[0]).toBe("abcd");
                expect(words[1]).toBe("efg");
            });
        });

        describe("has multiple words per line (by width)", () => {
            it("with space", () => {
                words = wordBreaker.splitByWidth("abcd efg hijk lmn opqr stu vwx yz", textProperties, textWidthMeasurer, 75, 3);

                expect(words.length).toBe(3);
                expect(words[0]).toBe("abcd efg hijk");
                expect(words[1]).toBe("lmn opqr stu");
                expect(words[2]).toBe("vwx yz");
            });

            it("with tab", () => {
                words = wordBreaker.splitByWidth("abcd\tefg\thijk\tlmn\topqr\tstu\tvwx\tyz", textProperties, textWidthMeasurer, 75, 3);

                expect(words.length).toBe(3);
                expect(words[0]).toBe("abcd efg hijk");
                expect(words[1]).toBe("lmn opqr stu");
                expect(words[2]).toBe("vwx yz");
            });

            it("with new line", () => {
                words = wordBreaker.splitByWidth("abcd\nefg\nhijk\nlmn\nopqr\nstu\nvwx\nyz", textProperties, textWidthMeasurer, 75, 3);

                expect(words.length).toBe(3);
                expect(words[0]).toBe("abcd efg hijk");
                expect(words[1]).toBe("lmn opqr stu");
                expect(words[2]).toBe("vwx yz");
            });
        });

        it("has multiple words per line (by width) but truncated by max lines", () => {
            words = wordBreaker.splitByWidth("abcd efg hijk lmn opqr stu vwx yz", textProperties, textWidthMeasurer, 75, 2);

            expect(words.length).toBe(2);
            expect(words[0]).toBe("abcd efg hijk");
            expect(words[1]).toBe("lmn opqr stu vwx yz");
        });

        it("has multiple words per line (by width) but does not truncate by max lines", () => {
            words = wordBreaker.splitByWidth("abcd efg hijk lmn opqr stu vwx yz", textProperties, textWidthMeasurer, 75, 0);

            expect(words.length).toBe(3);
            expect(words[0]).toBe("abcd efg hijk");
            expect(words[1]).toBe("lmn opqr stu");
            expect(words[2]).toBe("vwx yz");
        });

        it("has truncator", () => {
            let truncator = (properties: TextProperties, maxWidth: number) => {
                return properties.text?.slice(0, -1) + "…";
            };

            words = wordBreaker.splitByWidth("abcd efg hijk lmn opqr stu vwx yz", textProperties, textWidthMeasurer, 75, 0, truncator);

            expect(words.length).toBe(3);
            expect(words[0]).toBe("abcd efg hij…");
            expect(words[1]).toBe("lmn opqr st…");
            expect(words[2]).toBe("vwx y…");
        });
    });
});
