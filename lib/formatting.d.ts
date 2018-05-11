export interface DateFormat {
    value: Date;
    format: string;
}
/**
 * Translate .NET format into something supported by jQuery.Globalize.
 */
export declare function findDateFormat(value: Date, format: string, cultureName: string): DateFormat;
/**
 * Translates unsupported .NET custom format expressions to the custom expressions supported by JQuery.Globalize.
 */
export declare function fixDateTimeFormat(format: string): string;
