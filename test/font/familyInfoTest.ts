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
import { FamilyInfo } from "./../../src/font/familyInfo";

describe("FamilyInfo", () => {
    describe("family", () => {
        it("should call the getFamily method to get a result", () => {
            const familyInfo: FamilyInfo = createFamilyInfo();

            spyOn(familyInfo, "getFamily").and.callThrough();

            familyInfo.family;

            expect(familyInfo.getFamily).toHaveBeenCalled();
        });
    });

    describe("getFamily", () => {
        it("should return null if the families aren't defined", () => {
            const familyInfo: FamilyInfo = createFamilyInfo();

            const actualFamily: string = familyInfo.getFamily();

            expect(actualFamily).toBeNull();
        });

        it("should return the first font family if the regex is null", () => {
            const families: string[] = ["helvetica", "arial", "sans-serif"],
                familyInfo: FamilyInfo = createFamilyInfo(families);

            const actualFamily: string = familyInfo.getFamily(null);

            expect(actualFamily).toBe(families[0]);
        });

        it("should return a font family with the wf_ prefix", () => {
            const expectedFontFamily: string = "wf_test_font_family",
                families: string[] = ["helvetica", "arial", "sans-serif", expectedFontFamily],
                familyInfo: FamilyInfo = createFamilyInfo(families);

            const actualFamily: string = familyInfo.getFamily();

            expect(actualFamily).toBe(expectedFontFamily);
        });
    });

    describe("css", () => {
        it("should call the getCSS to get a result", () => {
            const familyInfo: FamilyInfo = createFamilyInfo();

            spyOn(familyInfo, "getCSS").and.callThrough();

            familyInfo.css;

            expect(familyInfo.getCSS).toHaveBeenCalled();
        });
    });

    describe("getCSS", () => {
        it("should return null if the families are undefined", () => {
            const familyInfo: FamilyInfo = createFamilyInfo();

            const actualCss: string = familyInfo.getCSS();

            expect(actualCss).toBeNull();
        });

        it("shouldn't wrap fonts", () => {
            const families: string[] = ["helvetica", "arial", "sans-serif"],
                familyInfo: FamilyInfo = createFamilyInfo(families);

            const actualCss: string = familyInfo.getCSS();

            expect(actualCss).toBe(families.join(", "));
        });

        it("should wrap fonts if they have an empty space", () => {
            const families: string[] = ["Power BI Font", "arial", "sans-serif"],
                familyInfo: FamilyInfo = createFamilyInfo(families);

            const actualCss: string = familyInfo.getCSS();

            expect(actualCss).toBe(`'${families[0]}', ${families.slice(1).join(", ")}`);
        });
    });
});

function createFamilyInfo(families?: string[]): FamilyInfo {
    return new FamilyInfo(families);
}
