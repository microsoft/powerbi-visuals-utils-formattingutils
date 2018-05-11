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

/** dateUtils module provides DateTimeSequence with set of additional date manipulation routines */
export module dateUtils {
    let MonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let MonthDaysLeap = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    /**
     * Returns bool indicating weither the provided year is a leap year.
     * @param year - year value
     */
    function isLeap(year: number): boolean {
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    }

    /**
     * Returns number of days in the provided year/month.
     * @param year - year value
     * @param month - month value
     */
    function getMonthDays(year: number, month: number) {
        return isLeap(year) ? MonthDaysLeap[month] : MonthDays[month];
    }

    /**
     * Adds a specified number of years to the provided date.
     * @param date - date value
     * @param yearDelta - number of years to add
     */
    export function addYears(date: Date, yearDelta: number): Date {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        let isLeapDay = month === 2 && day === 29;

        let result = new Date(date.getTime());
        year = year + yearDelta;
        if (isLeapDay && !isLeap(year)) {
            day = 28;
        }
        result.setFullYear(year, month, day);
        return result;
    }

    /**
     * Adds a specified number of months to the provided date.
     * @param date - date value
     * @param monthDelta - number of months to add
     */
    export function addMonths(date: Date, monthDelta: number): Date {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();

        let result = new Date(date.getTime());
        year += (monthDelta - (monthDelta % 12)) / 12;
        month += monthDelta % 12;

        // VSTS 1325771: Certain column charts don't display any data
        // Wrap arround the month if is after december (value 11)
        if (month > 11) {
            month = month % 12;
            year++;
        }

        day = Math.min(day, getMonthDays(year, month));
        result.setFullYear(year, month, day);
        return result;
    }

    /**
     * Adds a specified number of weeks to the provided date.
     * @param date - date value
     * @param weeks - number of weeks to add
     */
    export function addWeeks(date: Date, weeks: number): Date {
        return addDays(date, weeks * 7);
    }

    /**
     * Adds a specified number of days to the provided date.
     * @param date - date value
     * @param days - number of days to add
     */
    export function addDays(date: Date, days: number): Date {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        let result = new Date(date.getTime());
        result.setFullYear(year, month, day + days);
        return result;
    }

    /**
     * Adds a specified number of hours to the provided date.
     * @param date - date value
     * @param hours - number of hours to add
     */
    export function addHours(date: Date, hours: number): Date {
        return new Date(date.getTime() + hours * 3600000);
    }

    /**
     * Adds a specified number of minutes to the provided date.
     * @param date - date value
     * @param minutes - number of minutes to add
     */
    export function addMinutes(date: Date, minutes: number): Date {
        return new Date(date.getTime() + minutes * 60000);
    }

    /**
     * Adds a specified number of seconds to the provided date.
     * @param date - date value
     * @param seconds - number of seconds to add
     */
    export function addSeconds(date: Date, seconds: number): Date {
        return new Date(date.getTime() + seconds * 1000);
    }

    /**
     * Adds a specified number of milliseconds to the provided date.
     * @param date - date value
     * @param milliseconds - number of milliseconds to add
     */
    export function addMilliseconds(date: Date, milliseconds: number): Date {
        return new Date(date.getTime() + milliseconds);
    }
}
