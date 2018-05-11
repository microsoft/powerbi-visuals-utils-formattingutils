import { DateTimeUnit } from "./../formattingService/iFormattingService";
/** Repreasents the sequence of the dates/times */
export declare class DateTimeSequence {
    private static MIN_COUNT;
    private static MAX_COUNT;
    min: Date;
    max: Date;
    unit: DateTimeUnit;
    sequence: Date[];
    interval: number;
    intervalOffset: number;
    /** Creates new instance of the DateTimeSequence */
    constructor(unit: DateTimeUnit);
    /**
     * Add a new Date to a sequence.
     * @param date - date to add
     */
    add(date: Date): void;
    /**
     * Extends the sequence to cover new date range
     * @param min - new min to be covered by sequence
     * @param max - new max to be covered by sequence
     */
    extendToCover(min: Date, max: Date): void;
    /**
     * Move the sequence to cover new date range
     * @param min - new min to be covered by sequence
     * @param max - new max to be covered by sequence
     */
    moveToCover(min: Date, max: Date): void;
    /**
     * Calculate a new DateTimeSequence
     * @param dataMin - Date representing min of the data range
     * @param dataMax - Date representing max of the data range
     * @param expectedCount - expected number of intervals in the sequence
     * @param unit - of the intervals in the sequence
     */
    static calculate(dataMin: Date, dataMax: Date, expectedCount: number, unit?: DateTimeUnit): DateTimeSequence;
    static calculateYears(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence;
    static calculateMonths(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence;
    static calculateWeeks(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence;
    static calculateDays(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence;
    static calculateHours(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence;
    static calculateMinutes(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence;
    static calculateSeconds(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence;
    static calculateMilliseconds(dataMin: Date, dataMax: Date, expectedCount: number): DateTimeSequence;
    static addInterval(value: Date, interval: number, unit: DateTimeUnit): Date;
    private static fromNumericSequence(date, sequence, unit);
    private static getDelta(min, max, unit);
    static getIntervalUnit(min: Date, max: Date, maxCount: number): DateTimeUnit;
}
