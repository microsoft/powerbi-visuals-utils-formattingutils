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
    import IStorageService = powerbi.extensibility.utils.formatting.IStorageService;
    import LocalStorageService = powerbi.extensibility.utils.formatting.LocalStorageService;

    describe("LocalStorageService", () => {
        describe("getData", () => {
            it("should return null if local storage doesn't have data of the given key", () => {
                const storageService: IStorageService = createLocalStorageService();

                const actualData: any = storageService.getData("Power BI test key without any data");

                expect(actualData).toBeNull();
            });

            it("should return an object from the localStorage", () => {
                const storageService: IStorageService = createLocalStorageService(),
                    storageKey: string = "TestKey",
                    data: any = { product: "Power BI" };

                localStorage.setItem(storageKey, JSON.stringify(data));

                const actualData: any = storageService.getData(storageKey);

                expect(actualData).toBeDefined();

                localStorage.removeItem(storageKey);
            });
        });

        describe("setData", () => {
            it("should ", () => {
                const storageService: IStorageService = createLocalStorageService(),
                    storageKey: string = "TestKey",
                    data: any = { product: "Power BI" };

                storageService.setData(storageKey, data);

                const actualData: string = localStorage.getItem(storageKey);

                expect(actualData).toBe(JSON.stringify(data));

                localStorage.removeItem(storageKey);
            });
        });

        function createLocalStorageService(): IStorageService {
            return new LocalStorageService();
        }
    });
}
