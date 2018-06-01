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
import { DateTimeUnit, IFormattingService } from "./../../src/formattingService/iFormattingService";
import { FormattingService } from "./../../src/formattingService/formattingService";

describe("IFormattingService", () => {
    describe("format", () => {
        it("should return an empty string if the formatWithIndexedTokens is undefined", () => {
            const formattingService: IFormattingService = createFormattingService();

            const actualResult: string = formattingService.format(undefined, undefined);

            expect(actualResult).toBe("");
        });

        it("should return", () => {
            const formatWithIndexedTokens: string = "{{25:25}}",
                formattingService: IFormattingService = createFormattingService();

            const actualResult: string = formattingService.format(
                formatWithIndexedTokens,
                [100, 100]);

            expect(actualResult).toBe("{25:25}");
        });
    });

    describe("formatValue", () => {
        describe("cultures", () => {
            it("should use en-US as a default culture", () => {
                const date: Date = new Date(2010, 1, 1, 16, 35, 42),
                    expectedResult: string = "2/1/2010 4:35:42 PM";

                testFormatValue(date, expectedResult);
            });

            it("should use en-GB to format values", () => {
                const date: Date = new Date(2007, 2, 3, 17, 42, 42),
                    expectedResult: string = "03/03/2007 17:42:42";

                testFormatValue(date, expectedResult, "en-GB");
            });

            function testFormatValue(
                value: any,
                expectedResult: string,
                cultureSelector?: string): void {
                const formattingService: IFormattingService = createFormattingService();

                const actualResult: string = formattingService.formatValue(
                    value,
                    undefined,
                    cultureSelector);

                expect(actualResult).toBe(expectedResult);
            }
        });
    });

    describe("dateFormatString", () => {
        it("should call the initialize if the _dateTimeScaleFormatInfo is undefined", () => {
            const formattingService: IFormattingService = createFormattingService();

            spyOn(formattingService, <any>"initialize").and.callThrough();

            formattingService.dateFormatString(DateTimeUnit.Year);

            expect((formattingService as FormattingService)["initialize"]).toHaveBeenCalled();
        });
    });
});

function createFormattingService(): IFormattingService {
    return new FormattingService();
}
