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

// powerbi.extensibility.utils.formatting
import { DateFormat, findDateFormat, fixDateTimeFormat } from "./../src/formatting";

describe("fixDateTimeFormat", () => {
    it("should return a format without percentage", () => {
        const format: string = "%d%F",
            expectedFormat: string = "dF";

        const actualFormat: string = fixDateTimeFormat(format);

        expect(actualFormat).toBe(expectedFormat);
    });
});

describe("findDateFormat", () => {
    const defaultCultureName: string = "default",
        formats: string[] = [
            "m",
            "O",
            "o",
            "R",
            "r",
            "s",
            "u",
            "U",
            "y",
            "Y"
        ];

    for (let format of formats) {
        it(`should change the format if format is ${format}`, () => {
            checkResultFormat(
                format,
                format === "y"
                    ? undefined
                    : defaultCultureName);
        });
    }

    function checkResultFormat(format: string, cultureName: string): void {
        const date: Date = new Date(2017, 1, 1);

        const actualFormat: DateFormat = findDateFormat(
            date,
            format,
            cultureName);

        expect(actualFormat.format).not.toBe(format);
    }
});
