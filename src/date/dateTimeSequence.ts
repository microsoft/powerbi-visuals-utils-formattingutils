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

module powerbi.extensibility.utils.formatting {
    // powerbi.extensibility.utils.type
    import NumericSequenceRange = powerbi.extensibility.utils.type.NumericSequenceRange;
    import NumericSequence = powerbi.extensibility.utils.type.NumericSequence;
    import Double = powerbi.extensibility.utils.type.Double;

    // powerbi.extensibility.utils.formatting
    import DateTimeUnit = powerbi.extensibility.utils.formatting.DateTimeUnit;

    /** Repreasents the sequence of the dates/times */
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
        /** Creates new instance of the DateTimeSequence */
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
                x = DateTimeSequence.addInterval(x, -this.interval, this.unit);
                this.sequence.splice(0, 0, x);
            }
            this.min = x;

            x = this.max;
            while (x < max) {
                x = DateTimeSequence.addInterval(x, this.interval, this.unit);
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
            let delta: number = DateTimeSequence.getDelta(min, max, this.unit);
            let count = Math.floor(delta / this.interval);
            this.min = DateTimeSequence.addInterval(this.min, count * this.interval, this.unit);

            this.sequence = [];
            this.sequence.push(this.min);
            this.max = this.min;
            while (this.max < max) {
                this.max = DateTimeSequence.addInterval(this.max, this.interval, this.unit);
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
        public static calculate(dataMin: Date, dataMax: Date, expectedCount: number, unit?: DateTimeUnit): DateTimeSequence {
            if (!unit) {
                unit = DateTimeSequence.getIntervalUnit(dataMin, dataMax, expectedCount);
            }
            switch (unit) {
                case DateTimeUnit.Year:
                    return DateTimeSequence.calculateYears(dataMin, dataMax, expectedCount);
                case DateTimeUnit.Month:
                    return DateTimeSequence.calculateMonths(dataMin, dataMax, expectedCount);
                case DateTimeUnit.Week:
                    return DateTimeSequence.calculateWeeks(dataMin, dataMax, expectedCount);
                case DateTimeUnit.Day:
                    return DateTimeSequence.calculateDays(dataMin, dataMax, expectedCount);
                case DateTimeUnit.Hour:
                    return DateTimeSequence.calculateHours(dataMin, dataMax, expectedCount);
                case DateTimeUnit.Minute:
                    return DateTimeSequence.calculateMinutes(dataMin, dataMax, expectedCount);
                case DateTimeUnit.Second:
                    return DateTimeSequence.calculateSeconds(dataMin, dataMax, expectedCount);
                case DateTimeUnit.Millisecond:
                    return DateTimeSequence.calculateMilliseconds(dataMin, dataMax, expectedCount);
            }
        }

        public static calculateYears(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
            // Calculate range and sequence
            let yearsRange = NumericSequenceRange.calculateDataRange(dataMin.getFullYear(), dataMax.getFullYear(), false);

            // Calculate year sequence
            let sequence = NumericSequence.calculate(NumericSequenceRange.calculate(0, yearsRange.max - yearsRange.min), expectedCount, 0, null, null, [1, 2, 5]);
            let newMinYear = Math.floor(yearsRange.min / sequence.interval) * sequence.interval;
            let date = new Date(newMinYear, 0, 1);

            // Convert to date sequence
            let result = DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Year);
            return result;
        }

        public static calculateMonths(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
            // Calculate range
            let minYear = dataMin.getFullYear();
            let maxYear = dataMax.getFullYear();
            let minMonth = dataMin.getMonth();
            let maxMonth = (maxYear - minYear) * 12 + dataMax.getMonth();
            let date = new Date(minYear, 0, 1);

            // Calculate month sequence
            let sequence = NumericSequence.calculateUnits(minMonth, maxMonth, expectedCount, [1, 2, 3, 6, 12]);

            // Convert to date sequence
            let result = DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Month);
            return result;
        }

        public static calculateWeeks(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
            let firstDayOfWeek = 0;
            let minDayOfWeek = dataMin.getDay();
            let dayOffset = (minDayOfWeek - firstDayOfWeek + 7) % 7;
            let minDay = dataMin.getDate() - dayOffset;

            // Calculate range
            let date = new Date(dataMin.getFullYear(), dataMin.getMonth(), minDay);
            let min = 0;
            let max = Double.ceilWithPrecision(DateTimeSequence.getDelta(date, dataMax, DateTimeUnit.Week));

            // Calculate week sequence
            let sequence = NumericSequence.calculateUnits(min, max, expectedCount, [1, 2, 4, 8]);

            // Convert to date sequence
            let result = DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Week);
            return result;
        }

        public static calculateDays(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
            // Calculate range
            let date = new Date(dataMin.getFullYear(), dataMin.getMonth(), dataMin.getDate());
            let min = 0;
            let max = Double.ceilWithPrecision(DateTimeSequence.getDelta(dataMin, dataMax, DateTimeUnit.Day));

            // Calculate day sequence
            let sequence = NumericSequence.calculateUnits(min, max, expectedCount, [1, 2, 7, 14]);

            // Convert to date sequence
            let result = DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Day);
            return result;
        }

        public static calculateHours(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
            // Calculate range
            let date = new Date(dataMin.getFullYear(), dataMin.getMonth(), dataMin.getDate());
            let min = Double.floorWithPrecision(DateTimeSequence.getDelta(date, dataMin, DateTimeUnit.Hour));
            let max = Double.ceilWithPrecision(DateTimeSequence.getDelta(date, dataMax, DateTimeUnit.Hour));

            // Calculate hour sequence
            let sequence = NumericSequence.calculateUnits(min, max, expectedCount, [1, 2, 3, 6, 12, 24]);

            // Convert to date sequence
            let result = DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Hour);
            return result;
        }

        public static calculateMinutes(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
            // Calculate range
            let date = new Date(dataMin.getFullYear(), dataMin.getMonth(), dataMin.getDate(), dataMin.getHours());
            let min = Double.floorWithPrecision(DateTimeSequence.getDelta(date, dataMin, DateTimeUnit.Minute));
            let max = Double.ceilWithPrecision(DateTimeSequence.getDelta(date, dataMax, DateTimeUnit.Minute));

            // Calculate minutes numeric sequence
            let sequence = NumericSequence.calculateUnits(min, max, expectedCount, [1, 2, 5, 10, 15, 30, 60, 60 * 2, 60 * 3, 60 * 6, 60 * 12, 60 * 24]);

            // Convert to date sequence
            let result = DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Minute);
            return result;
        }

        public static calculateSeconds(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
            // Calculate range
            let date = new Date(dataMin.getFullYear(), dataMin.getMonth(), dataMin.getDate(), dataMin.getHours(), dataMin.getMinutes());
            let min = Double.floorWithPrecision(DateTimeSequence.getDelta(date, dataMin, DateTimeUnit.Second));
            let max = Double.ceilWithPrecision(DateTimeSequence.getDelta(date, dataMax, DateTimeUnit.Second));

            // Calculate minutes numeric sequence
            let sequence = NumericSequence.calculateUnits(min, max, expectedCount, [1, 2, 5, 10, 15, 30, 60, 60 * 2, 60 * 5, 60 * 10, 60 * 15, 60 * 30, 60 * 60]);

            // Convert to date sequence
            let result = DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Second);
            return result;
        }

        public static calculateMilliseconds(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence {
            // Calculate range
            let date = new Date(dataMin.getFullYear(), dataMin.getMonth(), dataMin.getDate(), dataMin.getHours(), dataMin.getMinutes(), dataMin.getSeconds());
            let min = DateTimeSequence.getDelta(date, dataMin, DateTimeUnit.Millisecond);
            let max = DateTimeSequence.getDelta(date, dataMax, DateTimeUnit.Millisecond);

            // Calculate milliseconds numeric sequence
            let sequence = NumericSequence.calculate(NumericSequenceRange.calculate(min, max), expectedCount, 0);

            // Convert to date sequence
            let result = DateTimeSequence.fromNumericSequence(date, sequence, DateTimeUnit.Millisecond);
            return result;
        }

        public static addInterval(value: Date, interval: number, unit: DateTimeUnit): Date {
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
            let result = new DateTimeSequence(unit);
            for (let i = 0; i < sequence.sequence.length; i++) {
                let x: number = sequence.sequence[i];
                let d: Date = DateTimeSequence.addInterval(date, x, unit);
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

        public static getIntervalUnit(min: Date, max: Date, maxCount: number): DateTimeUnit {
            maxCount = Math.max(maxCount, 2);
            let totalDays = DateTimeSequence.getDelta(min, max, DateTimeUnit.Day);
            if (totalDays > 356 && totalDays >= 30 * 6 * maxCount)
                return DateTimeUnit.Year;
            if (totalDays > 60 && totalDays > 7 * maxCount)
                return DateTimeUnit.Month;
            if (totalDays > 14 && totalDays > 2 * maxCount)
                return DateTimeUnit.Week;
            let totalHours = DateTimeSequence.getDelta(min, max, DateTimeUnit.Hour);
            if (totalDays > 2 && totalHours > 12 * maxCount)
                return DateTimeUnit.Day;
            if (totalHours >= 24 && totalHours >= maxCount)
                return DateTimeUnit.Hour;
            let totalMinutes = DateTimeSequence.getDelta(min, max, DateTimeUnit.Minute);
            if (totalMinutes > 2 && totalMinutes >= maxCount)
                return DateTimeUnit.Minute;
            let totalSeconds = DateTimeSequence.getDelta(min, max, DateTimeUnit.Second);
            if (totalSeconds > 2 && totalSeconds >= 0.8 * maxCount)
                return DateTimeUnit.Second;
            let totalMilliseconds = DateTimeSequence.getDelta(min, max, DateTimeUnit.Millisecond);
            if (totalMilliseconds > 0)
                return DateTimeUnit.Millisecond;

            // If the size of the range is 0 we need to guess the unit based on the date's non-zero values starting with milliseconds
            let date = min;
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
}
