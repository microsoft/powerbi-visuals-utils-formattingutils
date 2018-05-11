import { IFormattingService, DateTimeUnit } from "./iFormattingService";
/** Culture interfaces. These match the Globalize library interfaces intentionally. */
export interface Culture {
    name: string;
    calendar: Calendar;
    calendars: CalendarDictionary;
    numberFormat: NumberFormatInfo;
}
export interface Calendar {
    patterns: any;
    firstDay: number;
}
export interface CalendarDictionary {
    [key: string]: Calendar;
}
export interface NumberFormatInfo {
    decimals: number;
    groupSizes: number[];
    negativeInfinity: string;
    positiveInfinity: string;
}
/** Formatting Service */
export declare class FormattingService implements IFormattingService {
    private _currentCultureSelector;
    private _currentCulture;
    private _dateTimeScaleFormatInfo;
    formatValue(value: any, format?: string, cultureSelector?: string): string;
    format(formatWithIndexedTokens: string, args: any[], culture?: string): string;
    isStandardNumberFormat(format: string): boolean;
    formatNumberWithCustomOverride(value: number, format: string, nonScientificOverrideFormat: string, culture?: string): string;
    dateFormatString(unit: DateTimeUnit): string;
    /**
     * Sets the current localization culture
     * @param cultureSelector - name of a culture: "en", "en-UK", "fr-FR" etc. (See National Language Support (NLS) for full lists. Use "default" for invariant culture).
     */
    private setCurrentCulture(cultureSelector);
    /**
     * Gets the culture assotiated with the specified cultureSelector ("en", "en-US", "fr-FR" etc).
     * @param cultureSelector - name of a culture: "en", "en-UK", "fr-FR" etc. (See National Language Support (NLS) for full lists. Use "default" for invariant culture).
     * Exposing this function for testability of unsupported cultures
     */
    getCulture(cultureSelector?: string): Culture;
    /** By default the Globalization module initializes to the culture/calendar provided in the language/culture URL params */
    private initialize();
    /**
     *  Exposing this function for testability
     */
    getCurrentCulture(): string;
    /**
     *  Exposing this function for testability
     *  @param name: queryString name
     */
    getUrlParam(name: string): string;
}
/**
 * NumberFormat module contains the static methods for formatting the numbers.
 * It extends the JQuery.Globalize functionality to support complete set of .NET
 * formatting expressions for numeric types including custom formats.
 */
export declare module numberFormat {
    const NumberFormatComponentsDelimeter = ";";
    interface NumericFormatMetadata {
        format: string;
        hasLiterals: boolean;
        hasE: boolean;
        hasCommas: boolean;
        hasDots: boolean;
        hasPercent: boolean;
        hasPermile: boolean;
        precision: number;
        scale: number;
        partsPerScale: number;
    }
    interface NumberFormatComponents {
        hasNegative: boolean;
        positive: string;
        negative: string;
        zero: string;
    }
    function getNumericFormat(value: number, baseFormat: string): string;
    function addDecimalsToFormat(baseFormat: string, decimals: number, trailingZeros: boolean): string;
    function hasFormatComponents(format: string): boolean;
    function getComponents(format: string): NumberFormatComponents;
    /** Evaluates if the value can be formatted using the NumberFormat */
    function canFormat(value: any): boolean;
    function isStandardFormat(format: string): boolean;
    /** Formats the number using specified format expression and culture */
    function format(value: number, format: string, culture: Culture): string;
    /** Performs a custom format with a value override.  Typically used for custom formats showing scaled values. */
    function formatWithCustomOverride(value: number, format: string, nonScientificOverrideFormat: string, culture: Culture): string;
    /**
     * Returns the formatMetadata of the format
     * When calculating precision and scale, if format string of
     * positive[;negative;zero] => positive format will be used
     * @param (required) format - format string
     * @param (optional) calculatePrecision - calculate precision of positive format
     * @param (optional) calculateScale - calculate scale of positive format
     */
    function getCustomFormatMetadata(format: string, calculatePrecision?: boolean, calculateScale?: boolean, calculatePartsPerScale?: boolean): NumericFormatMetadata;
}
export declare const formattingService: IFormattingService;
