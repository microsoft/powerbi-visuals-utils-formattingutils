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

import * as dateUtils from "./dateUtils";

// powerbi.extensibility.utils.type
import { numericSequence, numericSequenceRange, double as Double } from "powerbi-visuals-utils-typeutils";
import  NumericSequence = numericSequence.NumericSequence;
import  NumericSequenceRange = numericSequenceRange.NumericSequenceRange;

// powerbi.extensibility.utils.formatting
import { DateTimeUnit } from "./../formattingService/iFormattingService";


// Repreasents the sequence of the dates/times
export class DateTimeSequence {
    // Constants
    private static MIN_COUNT: number = 1;
    private static MAX_COUNT: number = 1000;

    // Fields
    public min: Date;
    public max: Date;
    public unit: DateTimeUnit;
    public sequence: Date[];
    public interval: number;
    public intervalOffset: number;

    // Constructors
    // Creates new instance of the DateTimeSequence
    constructor(unit: DateTimeUnit) {
        this.unit = unit;
        this.sequence = [];
        this.min = new Date("9999-12-31T23:59:59.999");
        this.max = new Date("0001-01-01T00:00:00.000");
    }

    // Methods
    /**
     * Add a new Date to a sequence.
     * @param date - date to add
     */
    public add(date: Date) {
        if (date < this.min) {
            this.min = date;
        }
        if (date > this.max) {
            this.max = date;
        }
        this.sequence.push(date);
    }

    // Methods
    /**
     * Extends the sequence to cover new date range
     * @param min - new min to be covered by sequence
     * @param max - new max to be covered by sequence
     */
    public extendToCover(min: Date, max: Date): void {
        let x: Date = this.min;
        while (min < x) {
            x = DateTimeSequence.ADD_INTERVAL(x, -this.interval, this.unit);
            this.sequence.splice(0, 0, x);
        }
        this.min = x;

        x = this.max;
        while (x < max) {
            x = DateTimeSequence.ADD_INTERVAL(x, this.interval, this.unit);
            this.sequence.push(x);
        }
        this.max = x;
    }

    /**
     * Move the sequence to cover new date range
     * @param min - new min to be covered by sequence
     * @param max - new max to be covered by sequence
     */
    public moveToCover(min: Date, max: Date): void {
        const delta: number = DateTimeSequence.getDelta(min, max, this.unit);
        const count = Math.floor(delta / this.interval);
        this.min = DateTimeSequence.ADD_INTERVAL(this.min, count * this.interval, this.unit);

        this.sequence = [];
        this.sequence.push(this.min);
        this.max = this.min;
        while (this.max < max) {
            this.max = DateTimeSequence.ADD_INTERVAL(this.max, this.interval, this.unit);
            this.sequence.push(this.max);
        }
    }

    // Static
    /**
     * Calculate a new DateTimeSequence
     * @param dataMin - Date representing min of the data range
     * @param dataMax - Date representing max of the data range
     * @param expectedCount - expected number of intervals in the sequence
     * @param unit - of the intervals in the sequence
     */
    public static CALCULATE(dataMin: Date, dataMax: Date, expectedCount: number, unit?: DateTimeUnit): DateTimeSequence {
        if (!unit) {
            unit = DateTimeSequence.GET_INTERVAL_UNIT(dataMin, dataMax, expectedCount);
        }
        switch (unit) {
            case DateTimeUnit.Year:
                return DateTimeSequence.CALCULATE_YEARS(dataMin, dataMax, expectedCount);
            case DateTimeUnit.Month:
                return DateTimeSequence.CALCULATE_MONTHS(dataMin, dataMax, expectedCount);
            case DateTimeUnit.Week:
                return DateTimeSequence.CALCULATE_WEEKS(dataMin, dataMax, expectedCount);
            case DateTimeUnit.Day:
                return DateTimeSequence.CALCULATE_DAYS(dataMin, dataMax, expectedCount);
            case DateTimeUnit.Hour:
                return DateTimeSequence.CALCULATE_HOURS(dataMin, dataMax, expectedCount);
            case DateTimeUnit.Minute:
                return DateTimeSequence.CALCULATE_MINUTES(dataMin, dataMax, expectedCount);
            case DateTimeUnit.Second:
                return DateTimeSequence.CALCULATE_SECONDS(dataMin, dataMax, expectedCount);
            case DateTimeUnit.Millisecond:
                return DateTimeSequence.CALCULATE_MILLISECONDS(dataMin, dataMax, expectedCount);
        }
    }

    public static CALCULATE_YEARS(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
        // Calculate range and sequence
        const yearsRange = NumericSequenceRange.calculateDataRange(dataMin.getFullYear(), dataMax.getFullYear(), false);

        // Calculate year sequence
        const sequence = NumericSequence.calculate(NumericSequenceRange.calculate(0, yearsRange.max - yearsRange.min), expectedCount, 0, null, null, [1, 2, 5]);
        const newMinYear = Math.floor(yearsRange.min / sequence.interval) * sequence.interval;
        const date = new Date(newMinYear, 0, 1);

        // Convert to date sequence
        return DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Year);
    }

    public static CALCULATE_MONTHS(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
        // Calculate range
        const minYear = dataMin.getFullYear();
        const maxYear = dataMax.getFullYear();
        const minMonth = dataMin.getMonth();
        const maxMonth = (maxYear - minYear) * 12 + dataMax.getMonth();
        const date = new Date(minYear, 0, 1);

        // Calculate month sequence
        const sequence = NumericSequence.calculateUnits(minMonth, maxMonth, expectedCount, [1, 2, 3, 6, 12]);

        // Convert to date sequence
        return DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Month);
    }

    public static CALCULATE_WEEKS(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
        const firstDayOfWeek = 0;
        const minDayOfWeek = dataMin.getDay();
        const dayOffset = (minDayOfWeek - firstDayOfWeek + 7) % 7;
        const minDay = dataMin.getDate() - dayOffset;

        // Calculate range
        const date = new Date(dataMin.getFullYear(), dataMin.getMonth(), minDay);
        const min = 0;
        const max = Double.ceilWithPrecision(DateTimeSequence.getDelta(date, dataMax, DateTimeUnit.Week));

        // Calculate week sequence
        const sequence = NumericSequence.calculateUnits(min, max, expectedCount, [1, 2, 4, 8]);

        // Convert to date sequence
        return DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Week);
    }

    public static CALCULATE_DAYS(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
        // Calculate range
        const date = new Date(dataMin.getFullYear(), dataMin.getMonth(), dataMin.getDate());
        const min = 0;
        const max = Double.ceilWithPrecision(DateTimeSequence.getDelta(dataMin, dataMax, DateTimeUnit.Day));

        // Calculate day sequence
        const sequence = NumericSequence.calculateUnits(min, max, expectedCount, [1, 2, 7, 14]);

        // Convert to date sequence
        return DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Day);
    }

    public static CALCULATE_HOURS(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
        // Calculate range
        const date = new Date(dataMin.getFullYear(), dataMin.getMonth(), dataMin.getDate());
        const min = Double.floorWithPrecision(DateTimeSequence.getDelta(date, dataMin, DateTimeUnit.Hour));
        const max = Double.ceilWithPrecision(DateTimeSequence.getDelta(date, dataMax, DateTimeUnit.Hour));

        // Calculate hour sequence
        const sequence = NumericSequence.calculateUnits(min, max, expectedCount, [1, 2, 3, 6, 12, 24]);

        // Convert to date sequence
        return DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Hour);
    }

    public static CALCULATE_MINUTES(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
        // Calculate range
        const date = new Date(dataMin.getFullYear(), dataMin.getMonth(), dataMin.getDate(), dataMin.getHours());
        const min = Double.floorWithPrecision(DateTimeSequence.getDelta(date, dataMin, DateTimeUnit.Minute));
        const max = Double.ceilWithPrecision(DateTimeSequence.getDelta(date, dataMax, DateTimeUnit.Minute));

        // Calculate minutes numeric sequence
        const sequence = NumericSequence.calculateUnits(min, max, expectedCount, [1, 2, 5, 10, 15, 30, 60, 60 * 2, 60 * 3, 60 * 6, 60 * 12, 60 * 24]);

        // Convert to date sequence
        return DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Minute);
    }

    public static CALCULATE_SECONDS(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
        // Calculate range
        const date = new Date(dataMin.getFullYear(), dataMin.getMonth(), dataMin.getDate(), dataMin.getHours(), dataMin.getMinutes());
        const min = Double.floorWithPrecision(DateTimeSequence.getDelta(date, dataMin, DateTimeUnit.Second));
        const max = Double.ceilWithPrecision(DateTimeSequence.getDelta(date, dataMax, DateTimeUnit.Second));

        // Calculate minutes numeric sequence
        const sequence = NumericSequence.calculateUnits(min, max, expectedCount, [1, 2, 5, 10, 15, 30, 60, 60 * 2, 60 * 5, 60 * 10, 60 * 15, 60 * 30, 60 * 60]);

        // Convert to date sequence
        return DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Second);
    }

    public static CALCULATE_MILLISECONDS(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
        // Calculate range
        const date = new Date(dataMin.getFullYear(), dataMin.getMonth(), dataMin.getDate(), dataMin.getHours(), dataMin.getMinutes(), dataMin.getSeconds());
        const min = DateTimeSequence.getDelta(date, dataMin, DateTimeUnit.Millisecond);
        const max = DateTimeSequence.getDelta(date, dataMax, DateTimeUnit.Millisecond);

        // Calculate milliseconds numeric sequence
        const sequence = NumericSequence.calculate(NumericSequenceRange.calculate(min, max), expectedCount, 0);

        // Convert to date sequence
        return DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Millisecond);
    }

    public static ADD_INTERVAL(value: Date, interval: number, unit: DateTimeUnit): Date {
        interval = Math.round(interval);
        switch (unit) {
            case DateTimeUnit.Year:
                return dateUtils.addYears(value, interval);
            case DateTimeUnit.Month:
                return dateUtils.addMonths(value, interval);
            case DateTimeUnit.Week:
                return dateUtils.addWeeks(value, interval);
            case DateTimeUnit.Day:
                return dateUtils.addDays(value, interval);
            case DateTimeUnit.Hour:
                return dateUtils.addHours(value, interval);
            case DateTimeUnit.Minute:
                return dateUtils.addMinutes(value, interval);
            case DateTimeUnit.Second:
                return dateUtils.addSeconds(value, interval);
            case DateTimeUnit.Millisecond:
                return dateUtils.addMilliseconds(value, interval);
        }
    }

    private static fromNumericSequence(date: Date, sequence: NumericSequence, unit: DateTimeUnit) {
        const result = new DateTimeSequence(unit);
        for (let i = 0; i < sequence.sequence.length; i++) {
            const x: number = sequence.sequence[i];
            const d: Date = DateTimeSequence.ADD_INTERVAL(date, x, unit);
            result.add(d);
        }
        result.interval = sequence.interval;
        result.intervalOffset = sequence.intervalOffset;
        return result;
    }

    private static getDelta(min: Date, max: Date, unit: DateTimeUnit): number {
        let delta: number = 0;
        switch (unit) {
            case DateTimeUnit.Year:
                delta = max.getFullYear() - min.getFullYear();
                break;
            case DateTimeUnit.Month:
                delta = (max.getFullYear() - min.getFullYear()) * 12 + max.getMonth() - min.getMonth();
                break;
            case DateTimeUnit.Week:
                delta = (max.getTime() - min.getTime()) / (7 * 24 * 3600000);
                break;
            case DateTimeUnit.Day:
                delta = (max.getTime() - min.getTime()) / (24 * 3600000);
                break;
            case DateTimeUnit.Hour:
                delta = (max.getTime() - min.getTime()) / 3600000;
                break;
            case DateTimeUnit.Minute:
                delta = (max.getTime() - min.getTime()) / 60000;
                break;
            case DateTimeUnit.Second:
                delta = (max.getTime() - min.getTime()) / 1000;
                break;
            case DateTimeUnit.Millisecond:
                delta = max.getTime() - min.getTime();
                break;
        }
        return delta;
    }

    public static GET_INTERVAL_UNIT(min: Date, max: Date, maxCount: number): DateTimeUnit {
        maxCount = Math.max(maxCount, 2);
        const totalDays = DateTimeSequence.getDelta(min, max, DateTimeUnit.Day);
        if (totalDays > 356 && totalDays >= 30 * 6 * maxCount)
            return DateTimeUnit.Year;
        if (totalDays > 60 && totalDays > 7 * maxCount)
            return DateTimeUnit.Month;
        if (totalDays > 14 && totalDays > 2 * maxCount)
            return DateTimeUnit.Week;
        const totalHours = DateTimeSequence.getDelta(min, max, DateTimeUnit.Hour);
        if (totalDays > 2 && totalHours > 12 * maxCount)
            return DateTimeUnit.Day;
        if (totalHours >= 24 && totalHours >= maxCount)
            return DateTimeUnit.Hour;
        const totalMinutes = DateTimeSequence.getDelta(min, max, DateTimeUnit.Minute);
        if (totalMinutes > 2 && totalMinutes >= maxCount)
            return DateTimeUnit.Minute;
        const totalSeconds = DateTimeSequence.getDelta(min, max, DateTimeUnit.Second);
        if (totalSeconds > 2 && totalSeconds >= 0.8 * maxCount)
            return DateTimeUnit.Second;
        const totalMilliseconds = DateTimeSequence.getDelta(min, max, DateTimeUnit.Millisecond);
        if (totalMilliseconds > 0)
            return DateTimeUnit.Millisecond;

        // If the size of the range is 0 we need to guess the unit based on the date's non-zero values starting with milliseconds
        const date = min;
        if (date.getMilliseconds() !== 0)
            return DateTimeUnit.Millisecond;
        if (date.getSeconds() !== 0)
            return DateTimeUnit.Second;
        if (date.getMinutes() !== 0)
            return DateTimeUnit.Minute;
        if (date.getHours() !== 0)
            return DateTimeUnit.Hour;
        if (date.getDate() !== 1)
            return DateTimeUnit.Day;
        if (date.getMonth() !== 0)
            return DateTimeUnit.Month;

        return DateTimeUnit.Year;
    }
}
