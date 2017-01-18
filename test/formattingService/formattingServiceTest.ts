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

/// <reference path="../_references.ts" />

module powerbi.extensibility.utils.formatting.test {
    // powerbi.extensibility.utils.formatting
    import DateTimeUnit = powerbi.extensibility.utils.formatting.DateTimeUnit;
    import FormattingService = powerbi.extensibility.utils.formatting.FormattingService;
    import IFormattingService = powerbi.extensibility.utils.formatting.IFormattingService;

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

        describe("dateFormatString", () => {
            it("should call the initialize if the _dateTimeScaleFormatInfo is undefined", () => {
                const formattingService: IFormattingService = createFormattingService();

                spyOn(formattingService, "initialize").and.callThrough();

                formattingService.dateFormatString(DateTimeUnit.Year);

                expect((formattingService as FormattingService)["initialize"]).toHaveBeenCalled();
            });
        });
    });

    function createFormattingService(): IFormattingService {
        return new FormattingService();
    }
}
