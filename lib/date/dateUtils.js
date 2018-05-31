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
export var dateUtils;
(function (dateUtils) {
    let MonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let MonthDaysLeap = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    /**
     * Returns bool indicating weither the provided year is a leap year.
     * @param year - year value
     */
    function isLeap(year) {
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    }
    /**
     * Returns number of days in the provided year/month.
     * @param year - year value
     * @param month - month value
     */
    function getMonthDays(year, month) {
        return isLeap(year) ? MonthDaysLeap[month] : MonthDays[month];
    }
    /**
     * Adds a specified number of years to the provided date.
     * @param date - date value
     * @param yearDelta - number of years to add
     */
    function addYears(date, yearDelta) {
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
    dateUtils.addYears = addYears;
    /**
     * Adds a specified number of months to the provided date.
     * @param date - date value
     * @param monthDelta - number of months to add
     */
    function addMonths(date, monthDelta) {
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
    dateUtils.addMonths = addMonths;
    /**
     * Adds a specified number of weeks to the provided date.
     * @param date - date value
     * @param weeks - number of weeks to add
     */
    function addWeeks(date, weeks) {
        return addDays(date, weeks * 7);
    }
    dateUtils.addWeeks = addWeeks;
    /**
     * Adds a specified number of days to the provided date.
     * @param date - date value
     * @param days - number of days to add
     */
    function addDays(date, days) {
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        let result = new Date(date.getTime());
        result.setFullYear(year, month, day + days);
        return result;
    }
    dateUtils.addDays = addDays;
    /**
     * Adds a specified number of hours to the provided date.
     * @param date - date value
     * @param hours - number of hours to add
     */
    function addHours(date, hours) {
        return new Date(date.getTime() + hours * 3600000);
    }
    dateUtils.addHours = addHours;
    /**
     * Adds a specified number of minutes to the provided date.
     * @param date - date value
     * @param minutes - number of minutes to add
     */
    function addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes * 60000);
    }
    dateUtils.addMinutes = addMinutes;
    /**
     * Adds a specified number of seconds to the provided date.
     * @param date - date value
     * @param seconds - number of seconds to add
     */
    function addSeconds(date, seconds) {
        return new Date(date.getTime() + seconds * 1000);
    }
    dateUtils.addSeconds = addSeconds;
    /**
     * Adds a specified number of milliseconds to the provided date.
     * @param date - date value
     * @param milliseconds - number of milliseconds to add
     */
    function addMilliseconds(date, milliseconds) {
        return new Date(date.getTime() + milliseconds);
    }
    dateUtils.addMilliseconds = addMilliseconds;
})(dateUtils || (dateUtils = {}));
//# sourceMappingURL=dateUtils.js.map