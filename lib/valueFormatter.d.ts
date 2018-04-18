/// <reference types="powerbi-visuals-tools" />
import { DisplayUnitSystem, DisplayUnitSystemNames } from "./displayUnitSystem/displayUnitSystem";
import { DisplayUnitSystemType } from "./displayUnitSystem/displayUnitSystemType";
import { DisplayUnit } from "./displayUnitSystem/displayUnitSystem";
import { numberFormat as NumberFormat } from "./formattingService/formattingService";
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
import ValueTypeDescriptor = powerbi.ValueTypeDescriptor;
/**
 * Formats the value using provided format expression
 * @param value - value to be formatted and converted to string.
 * @param format - format to be applied if the number shouldn't be abbreviated.
 * If the number should be abbreviated this string is checked for special characters like $ or % if any
 */
export interface ICustomValueFormatter {
    (value: any, format?: string): string;
}
export interface ICustomValueColumnFormatter {
    (value: any, column: DataViewMetadataColumn, formatStringProp: DataViewObjectPropertyIdentifier, nullsAreBlank?: boolean): string;
}
export interface ValueFormatterOptions {
    /** The format string to use. */
    format?: string;
    /** The data value. */
    value?: any;
    /** The data value. */
    value2?: any;
    /** The number of ticks. */
    tickCount?: any;
    /** The display unit system to use */
    displayUnitSystemType?: DisplayUnitSystemType;
    /** True if we are formatting single values in isolation (e.g. card), as opposed to multiple values with a common base (e.g. chart axes) */
    formatSingleValues?: boolean;
    /** True if we want to trim off unnecessary zeroes after the decimal and remove a space before the % symbol */
    allowFormatBeautification?: boolean;
    /** Specifies the maximum number of decimal places to show*/
    precision?: number;
    /** Detect axis precision based on value */
    detectAxisPrecision?: boolean;
    /** Specifies the column type of the data value */
    columnType?: ValueTypeDescriptor;
    /** Specifies the culture */
    cultureSelector?: string;
}
export interface IValueFormatter {
    format(value: any): string;
    displayUnit?: DisplayUnit;
    options?: ValueFormatterOptions;
}
/** Captures all locale-specific options used by the valueFormatter. */
export interface ValueFormatterLocalizationOptions {
    nullValue: string;
    trueValue: string;
    falseValue: string;
    NaN: string;
    infinity: string;
    negativeInfinity: string;
    /** Returns a beautified form the given format string. */
    beautify(format: string): string;
    /** Returns an object describing the given exponent in the current language. */
    describe(exponent: number): DisplayUnitSystemNames;
    restatementComma: string;
    restatementCompoundAnd: string;
    restatementCompoundOr: string;
}
export declare module valueFormatter {
    const DefaultIntegerFormat = "g";
    const DefaultNumericFormat = "#,0.00";
    const DefaultDateFormat = "d";
    function getLocalizedString(stringId: string): string;
    function getFormatMetadata(format: string): NumberFormat.NumericFormatMetadata;
    function setLocaleOptions(options: ValueFormatterLocalizationOptions): void;
    function createDefaultFormatter(formatString: string, allowFormatBeautification?: boolean, cultureSelector?: string): IValueFormatter;
    /** Creates an IValueFormatter to be used for a range of values. */
    function create(options: ValueFormatterOptions): IValueFormatter;
    function format(value: any, format?: string, allowFormatBeautification?: boolean, cultureSelector?: string): string;
    /**
     * Value formatting function to handle variant measures.
     * For a Date/Time value within a non-date/time field, it's formatted with the default date/time formatString instead of as a number
     * @param {any} value Value to be formatted
     * @param {DataViewMetadataColumn} column Field which the value belongs to
     * @param {DataViewObjectPropertyIdentifier} formatStringProp formatString Property ID
     * @param {boolean} nullsAreBlank? Whether to show "(Blank)" instead of empty string for null values
     * @returns Formatted value
     */
    function formatVariantMeasureValue(value: any, column: DataViewMetadataColumn, formatStringProp: DataViewObjectPropertyIdentifier, nullsAreBlank?: boolean, cultureSelector?: string): string;
    function createDisplayUnitSystem(displayUnitSystemType?: DisplayUnitSystemType): DisplayUnitSystem;
    function getFormatString(column: DataViewMetadataColumn, formatStringProperty: DataViewObjectPropertyIdentifier, suppressTypeFallback?: boolean): string;
    function getFormatStringByColumn(column: DataViewMetadataColumn, suppressTypeFallback?: boolean): string;
    /** The returned string will look like 'A, B, ..., and C'  */
    function formatListAnd(strings: string[]): string;
    /** The returned string will look like 'A, B, ..., or C' */
    function formatListOr(strings: string[]): string;
    function getDisplayUnits(displayUnitSystemType: DisplayUnitSystemType): DisplayUnit[];
}
