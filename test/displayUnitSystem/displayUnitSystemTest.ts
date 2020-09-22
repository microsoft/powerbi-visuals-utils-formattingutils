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

import {
    DisplayUnit,
    DisplayUnitSystem,
    DisplayUnitSystemNames,
    DataLabelsDisplayUnitSystem
} from "./../../src/displayUnitSystem/displayUnitSystem";

describe("DisplayUnit", () => {
    describe("project", () => {
        it("should return the value if the this.value is undefined", () => {
            const expectedValue: number = 42,
                displayUnit: DisplayUnit = createDisplayUnit();

            const actualValue: number = displayUnit.project(expectedValue);

            expect(actualValue).toBe(expectedValue);
        });
    });

    describe("reverseProject", () => {
        it("should return the value if the this.value is undefined", () => {
            const expectedValue: number = 42,
                displayUnit: DisplayUnit = createDisplayUnit();

            const actualValue: number = displayUnit.reverseProject(expectedValue);

            expect(actualValue).toBe(expectedValue);
        });

        it("should return 84 if the value is 42 and the this.value is 2", () => {
            const internalValue: number = 2,
                expectedValue: number = 42,
                displayUnit: DisplayUnit = createDisplayUnit();

            displayUnit.value = internalValue;

            const actualValue: number = displayUnit.reverseProject(expectedValue);

            expect(actualValue).toBe(expectedValue * internalValue);
        });
    });
});

describe("DisplayUnitSystem", () => {
    describe("constructor", () => {
        it("the units  shouldn't be empty", () => {
            const displayUnitSystem: DisplayUnitSystem = createDisplayUnitSystem();

            expect(displayUnitSystem.units).toBeDefined();
        });
    });

    describe("title", () => {
        it("should return undefined if the displayUnit is undefined", () => {
            const displayUnitSystem: DisplayUnitSystem = createDisplayUnitSystem();

            const actualTitle: string = displayUnitSystem.title;

            expect(actualTitle).toBeUndefined();
        });

        it("should return title of the dispaly unit if the displayUnit is defined", () => {
            const expectedTitle: string = "Power BI",
                displayUnit: DisplayUnit = createDisplayUnit(),
                displayUnitSystem: DisplayUnitSystem = createDisplayUnitSystem();

            displayUnit.title = expectedTitle;
            displayUnitSystem.displayUnit = displayUnit;

            const actualTitle: string = displayUnitSystem.title;

            expect(actualTitle).toBe(expectedTitle);
        });
    });

    describe("update", () => {
        it("shouldn't call findApplicableDisplayUnit if the value is undefined", () => {
            const displayUnitSystem: DisplayUnitSystem = createDisplayUnitSystem();

            spyOn(displayUnitSystem, <any>"findApplicableDisplayUnit").and.callThrough();

            displayUnitSystem.update(undefined);

            expect(displayUnitSystem["findApplicableDisplayUnit"]).not.toHaveBeenCalled();
        });
    });

    describe("isPercentageFormat", () => {
        it("should return true if the format is percentage", () => {
            const format: string = "%",
                displayUnitSystem: DisplayUnitSystem = createDisplayUnitSystem();

            const actualResult: boolean = displayUnitSystem.isPercentageFormat(format);

            expect(actualResult).toBeTruthy();
        });
    });

    function createDisplayUnitSystem(units?: DisplayUnit[]): DisplayUnitSystem {
        return new DisplayUnitSystem(null, units);
    }
});

describe("DataLabelsDisplayUnitSystem", () => {
    describe("isFormatSupported", () => {
        it("should return true if format is supported", () => {
            const format: string = "%",
                systemNames: DisplayUnitSystemNames[] = createDisplayUnitSystemNames(),
                labelsUnitSystem: DataLabelsDisplayUnitSystem = createDataLabelsDisplayUnitSystem(systemNames);

            const actualResult: boolean = labelsUnitSystem.isFormatSupported(format);

            expect(actualResult).toBeTruthy();
        });
    });

    describe("format", () => {
        it("should return a value in percentage format", () => {
            const expectedFormat: string = "%",
                systemNames: DisplayUnitSystemNames[] = createDisplayUnitSystemNames(),
                labelsUnitSystem: DataLabelsDisplayUnitSystem = createDataLabelsDisplayUnitSystem(systemNames);

            const actualValue: string = labelsUnitSystem.format(42, "%");

            expect(actualValue).toBe(expectedFormat);
        });
    });

    function createDataLabelsDisplayUnitSystem(systemNames: DisplayUnitSystemNames[]): DataLabelsDisplayUnitSystem {
        return new DataLabelsDisplayUnitSystem((exponent: number) => {
            return systemNames[exponent] || systemNames[0];
        }, null);
    }

    function createDisplayUnitSystemNames(): DisplayUnitSystemNames[] {
        return [
            {
                title: "Percentage",
                format: "%"
            },
            {
                title: "Number",
                format: "d"
            }
        ];
    }
});

function createDisplayUnit(): DisplayUnit {
    return new DisplayUnit();
}
