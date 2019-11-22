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


import { DateTimeUnit } from "./../../src/formattingService/iFormattingService";
import { DateTimeSequence } from "./../../src/date/dateTimeSequence";

describe("DateTimeSequence ", () => {
    describe("add", () => {
        it("should add a date to the sequence", () => {
            const date: Date = new Date(2017, 0, 18),
                dateTimeSequence: DateTimeSequence = createDateTimeSequence();

            dateTimeSequence.add(date);

            expect(dateTimeSequence.sequence[0]).toBe(date);
        });
    });

    describe("extendToCover", () => {
        it("should extend the existing date sequence", () => {
            const interval: number = 5,
                expectedAmountOfDates: number = 18,
                baseMinDate: Date = new Date(2016, 11, 18),
                baseMaxDate: Date = new Date(2017, 0, 5),
                minDate: Date = new Date(2016, 9, 18),
                maxDate: Date = new Date(2017, 0, 18),
                dateTimeSequence: DateTimeSequence = createDateTimeSequence();

            dateTimeSequence.add(baseMinDate);
            dateTimeSequence.add(baseMaxDate);

            dateTimeSequence.interval = interval;

            dateTimeSequence.extendToCover(minDate, maxDate);

            expect(dateTimeSequence.sequence.length).toBe(expectedAmountOfDates);
        });
    });

    describe("moveToCover", () => {
        it("should move the sequence in order to cover new date range", () => {
            const interval: number = 5,
                expectedAmountOfDates: number = 63,
                baseMinDate: Date = new Date(2015, 11, 18),
                baseMaxDate: Date = new Date(2017, 0, 5),
                minDate: Date = new Date(2016, 9, 18),
                maxDate: Date = new Date(2017, 0, 18),
                dateTimeSequence: DateTimeSequence = createDateTimeSequence();

            dateTimeSequence.add(baseMinDate);
            dateTimeSequence.add(baseMaxDate);

            dateTimeSequence.interval = interval;

            dateTimeSequence.moveToCover(minDate, maxDate);

            expect(dateTimeSequence.sequence.length).toBe(expectedAmountOfDates);
        });
    });

    describe("calculate", () => {
        it("should use a month as unit if the unit is undefined", () => {
            const expectedCount: number = 5,
                minDate: Date = new Date(2016, 5, 15),
                maxDate: Date = new Date(2017, 1, 15);

            const dateTimeSequence: DateTimeSequence = DateTimeSequence.CALCULATE(
                minDate,
                maxDate,
                expectedCount);

            expect(dateTimeSequence.unit).toBe(DateTimeUnit.Month);
        });

        it("should call the calculateYears if unit is a year", () => {
            const expectedCount: number = 5,
                minDate: Date = new Date(2010, 5, 15),
                maxDate: Date = new Date(2017, 1, 15);

            spyOn(DateTimeSequence, "CALCULATE_YEARS").and.callThrough();

            const dateTimeSequence: DateTimeSequence = DateTimeSequence.CALCULATE(
                minDate,
                maxDate,
                expectedCount,
                DateTimeUnit.Year);

            expect(DateTimeSequence.CALCULATE_YEARS).toHaveBeenCalled();
        });

        it("should call the calculateWeeks if unit is a week", () => {
            const expectedCount: number = 5,
                minDate: Date = new Date(2010, 5, 15),
                maxDate: Date = new Date(2017, 1, 15);

            spyOn(DateTimeSequence, "CALCULATE_WEEKS").and.callThrough();

            const dateTimeSequence: DateTimeSequence = DateTimeSequence.CALCULATE(
                minDate,
                maxDate,
                expectedCount,
                DateTimeUnit.Week);

            expect(DateTimeSequence.CALCULATE_WEEKS).toHaveBeenCalled();
        });

        it("should call the calculateDays if unit is a day", () => {
            const expectedCount: number = 5,
                minDate: Date = new Date(2010, 5, 15),
                maxDate: Date = new Date(2017, 1, 15);

            spyOn(DateTimeSequence, "CALCULATE_DAYS").and.callThrough();

            const dateTimeSequence: DateTimeSequence = DateTimeSequence.CALCULATE(
                minDate,
                maxDate,
                expectedCount,
                DateTimeUnit.Day);

            expect(DateTimeSequence.CALCULATE_DAYS).toHaveBeenCalled();
        });

        it("should call the calculateHours if unit is a day", () => {
            const expectedCount: number = 5,
                minDate: Date = new Date(2010, 5, 15),
                maxDate: Date = new Date(2017, 1, 15);

            spyOn(DateTimeSequence, "CALCULATE_HOURS").and.callThrough();

            const dateTimeSequence: DateTimeSequence = DateTimeSequence.CALCULATE(
                minDate,
                maxDate,
                expectedCount,
                DateTimeUnit.Hour);

            expect(DateTimeSequence.CALCULATE_HOURS).toHaveBeenCalled();
        });

        it("should call the calculateMinutes if unit is a minute", () => {
            const expectedCount: number = 5,
                minDate: Date = new Date(2010, 5, 15),
                maxDate: Date = new Date(2017, 1, 15);

            spyOn(DateTimeSequence, "CALCULATE_MINUTES").and.callThrough();

            const dateTimeSequence: DateTimeSequence = DateTimeSequence.CALCULATE(
                minDate,
                maxDate,
                expectedCount,
                DateTimeUnit.Minute);

            expect(DateTimeSequence.CALCULATE_MINUTES).toHaveBeenCalled();
        });

        it("should call the calculateMinutes if unit is a second", () => {
            const expectedCount: number = 5,
                minDate: Date = new Date(2010, 5, 15),
                maxDate: Date = new Date(2017, 1, 15);

            spyOn(DateTimeSequence, "CALCULATE_SECONDS").and.callThrough();

            const dateTimeSequence: DateTimeSequence = DateTimeSequence.CALCULATE(
                minDate,
                maxDate,
                expectedCount,
                DateTimeUnit.Second);

            expect(DateTimeSequence.CALCULATE_SECONDS).toHaveBeenCalled();
        });

        it("should call the calculateMinutes if unit is a millisecond", () => {
            const expectedCount: number = 5,
                minDate: Date = new Date(2010, 5, 15),
                maxDate: Date = new Date(2017, 1, 15);

            spyOn(DateTimeSequence, "CALCULATE_MILLISECONDS").and.callThrough();

            const dateTimeSequence: DateTimeSequence = DateTimeSequence.CALCULATE(
                minDate,
                maxDate,
                expectedCount,
                DateTimeUnit.Millisecond);

            expect(DateTimeSequence.CALCULATE_MILLISECONDS).toHaveBeenCalled();
        });
    });

    function createDateTimeSequence(): DateTimeSequence {
        return new DateTimeSequence(DateTimeUnit.Day);
    }
});
