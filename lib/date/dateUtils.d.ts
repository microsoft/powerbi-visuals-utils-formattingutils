/** dateUtils module provides DateTimeSequence with set of additional date manipulation routines */
export declare module dateUtils {
    /**
     * Adds a specified number of years to the provided date.
     * @param date - date value
     * @param yearDelta - number of years to add
     */
    function addYears(date: Date, yearDelta: number): Date;
    /**
     * Adds a specified number of months to the provided date.
     * @param date - date value
     * @param monthDelta - number of months to add
     */
    function addMonths(date: Date, monthDelta: number): Date;
    /**
     * Adds a specified number of weeks to the provided date.
     * @param date - date value
     * @param weeks - number of weeks to add
     */
    function addWeeks(date: Date, weeks: number): Date;
    /**
     * Adds a specified number of days to the provided date.
     * @param date - date value
     * @param days - number of days to add
     */
    function addDays(date: Date, days: number): Date;
    /**
     * Adds a specified number of hours to the provided date.
     * @param date - date value
     * @param hours - number of hours to add
     */
    function addHours(date: Date, hours: number): Date;
    /**
     * Adds a specified number of minutes to the provided date.
     * @param date - date value
     * @param minutes - number of minutes to add
     */
    function addMinutes(date: Date, minutes: number): Date;
    /**
     * Adds a specified number of seconds to the provided date.
     * @param date - date value
     * @param seconds - number of seconds to add
     */
    function addSeconds(date: Date, seconds: number): Date;
    /**
     * Adds a specified number of milliseconds to the provided date.
     * @param date - date value
     * @param milliseconds - number of milliseconds to add
     */
    function addMilliseconds(date: Date, milliseconds: number): Date;
}
