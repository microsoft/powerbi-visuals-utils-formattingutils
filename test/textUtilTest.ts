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

module powerbi.extensibility.utils.formatting.textUtil.test {
    // powerbi.extensibility.utils.formatting
    import textUtil = powerbi.extensibility.utils.formatting.textUtil;

    describe("textUtil", () => {
        describe("removeBreakingSpaces", () => {
            it("should replace white spaces", () => {
                const strWithWhitespace: string = " Power BI",
                    expectedValue: string = "&nbspPower&nbspBI";

                const actualValue: string = textUtil.removeBreakingSpaces(strWithWhitespace);

                expect(actualValue).toBe(expectedValue);
            });
        });

        describe("removeEllipses", () => {
            it("should remove the dots at ending of the strings", () => {
                const strWithDots: string = "Power BI...",
                    expectedValue: string = "Power BI";

                const actualValue: string = textUtil.removeEllipses(strWithDots);

                expect(actualValue).toBe(expectedValue);
            });
        });

        describe("replaceSpaceWithNBSP", () => {
            it("should return undefined if the given string is undefined", () => {
                const expectedValue: string = undefined;

                const actualValue: string = textUtil.replaceSpaceWithNBSP(expectedValue);

                expect(actualValue).toBe(expectedValue);
            });

            it("should replace white spaces", () => {
                const strWithWhitespace: string = "Power BI",
                    expectedValue: string = "Power\xA0BI";

                const actualValue: string = textUtil.replaceSpaceWithNBSP(strWithWhitespace);

                expect(actualValue).toBe(expectedValue);
            });
        });
    });
}
