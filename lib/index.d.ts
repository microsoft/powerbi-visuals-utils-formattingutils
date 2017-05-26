interface GlobalizeCulture {
    name: string;
    calendar: GlobalizeCalendar;
    calendars: CalendarDictionary;
    numberFormat: GlobalizeNumberFormat;
}
interface GlobalizeCalendar {
    patterns: any;
    firstDay: number;
}
interface CalendarDictionary {
    [key: string]: GlobalizeCalendar;
}
interface GlobalizeNumberFormat {
    decimals: number;
    groupSizes: number[];
    negativeInfinity: string;
    positiveInfinity: string;
}
interface GlobalizeStatic {
    culture(cultureSelector?: string): GlobalizeCulture;
    format(value: any, format: string, culture?: any): any;
    parseInt(value: string, culture?: any): number;
    parseFloat(value: string, culture?: any): number;
    parseDate(value: string, formats: string[], culture?: any): Date;
    cultures: any;
    findClosestCulture(cultureSelector: string): GlobalizeCulture;
}
declare var Globalize: GlobalizeStatic;
declare module powerbi.extensibility.utils.formatting {
    interface IStorageService {
        getData(key: string): any;
        setData(key: string, data: any): void;
    }
}
declare module powerbi.extensibility.utils.formatting {
    class LocalStorageService implements IStorageService {
        getData(key: string): any;
        setData(key: string, data: any): void;
    }
}
declare module powerbi.extensibility.utils.formatting {
    class EphemeralStorageService implements IStorageService {
        private cache;
        private clearCacheTimerId;
        private clearCacheInterval;
        static defaultClearCacheInterval: number;
        constructor(clearCacheInterval?: number);
        getData(key: string): any;
        setData(key: string, data: any): void;
        private clearCache();
    }
    const ephemeralStorageService: EphemeralStorageService;
}
declare module powerbi.extensibility.utils.formatting {
    /**
     * Extensions to String class.
     */
    module stringExtensions {
        /**
         * Checks if a string ends with a sub-string.
         */
        function endsWith(str: string, suffix: string): boolean;
        function format(...args: string[]): string;
        /**
         * Compares two strings for equality, ignoring case.
         */
        function equalIgnoreCase(a: string, b: string): boolean;
        function startsWithIgnoreCase(a: string, b: string): boolean;
        function startsWith(a: string, b: string): boolean;
        /** Determines whether a string contains a specified substring (by case-sensitive comparison). */
        function contains(source: string, substring: string): boolean;
        /** Determines whether a string contains a specified substring (while ignoring case). */
        function containsIgnoreCase(source: string, substring: string): boolean;
        /**
         * Normalizes case for a string.
         * Used by equalIgnoreCase method.
         */
        function normalizeCase(value: string): string;
        /**
         * Receives a string and returns an ArrayBuffer of its characters.
         * @return An ArrayBuffer of the string's characters.
         * If the string is empty or null or undefined - returns null.
         */
        function stringToArrayBuffer(str: string): ArrayBuffer;
        /**
         * Is string null or empty or undefined?
         * @return True if the value is null or undefined or empty string,
         * otherwise false.
         */
        function isNullOrEmpty(value: string): boolean;
        /**
         * Returns true if the string is null, undefined, empty, or only includes white spaces.
         * @return True if the str is null, undefined, empty, or only includes white spaces,
         * otherwise false.
         */
        function isNullOrUndefinedOrWhiteSpaceString(str: string): boolean;
        /**
         * Returns a value indicating whether the str contains any whitespace.
         */
        function containsWhitespace(str: string): boolean;
        /**
         * Returns a value indicating whether the str is a whitespace string.
         */
        function isWhitespace(str: string): boolean;
        /**
         * Returns the string with any trailing whitespace from str removed.
         */
        function trimTrailingWhitespace(str: string): string;
        /**
         * Returns the string with any leading and trailing whitespace from str removed.
         */
        function trimWhitespace(str: string): string;
        /**
         * Returns length difference between the two provided strings.
         */
        function getLengthDifference(left: string, right: string): number;
        /**
         * Repeat char or string several times.
         * @param char The string to repeat.
         * @param count How many times to repeat the string.
         */
        function repeat(char: string, count: number): string;
        /**
         * Replace all the occurrences of the textToFind in the text with the textToReplace.
         * @param text The original string.
         * @param textToFind Text to find in the original string.
         * @param textToReplace New text replacing the textToFind.
         */
        function replaceAll(text: string, textToFind: string, textToReplace: string): string;
        function ensureUniqueNames(names: string[]): string[];
        /**
         * Returns a name that is not specified in the values.
         */
        function findUniqueName(usedNames: {
            [name: string]: boolean;
        }, baseName: string): string;
        function constructNameFromList(list: string[], separator: string, maxCharacter: number): string;
        function escapeStringForRegex(s: string): string;
        /**
         * Remove file name reserved characters <>:"/\|?* from input string.
         */
        function normalizeFileName(fileName: string): string;
        /**
         * Similar to JSON.stringify, but strips away escape sequences so that the resulting
         * string is human-readable (and parsable by JSON formatting/validating tools).
         */
        function stringifyAsPrettyJSON(object: any): string;
        /**
         * Derive a CLS-compliant name from a specified string.  If no allowed characters are present, return a fallback string instead.
         * TODO (6708134): this should have a fully Unicode-aware implementation
         */
        function deriveClsCompliantName(input: string, fallback: string): string;
        /** Performs cheap sanitization by stripping away HTML tag (<>) characters. */
        function stripTagDelimiters(s: string): string;
    }
}
declare module powerbi.extensibility.utils.formatting.wordBreaker {
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import ITextAsSVGMeasurer = powerbi.extensibility.utils.formatting.ITextAsSVGMeasurer;
    import ITextTruncator = powerbi.extensibility.utils.formatting.ITextTruncator;
    interface WordBreakerResult {
        start: number;
        end: number;
    }
    /**
     * Find the word nearest the cursor specified within content
     * @param index - point within content to search forward/backward from
     * @param content - string to search
    */
    function find(index: number, content: string): WordBreakerResult;
    /**
     * Test for presence of breakers within content
     * @param content - string to test
    */
    function hasBreakers(content: string): boolean;
    /**
     * Count the number of pieces when broken by BREAKERS_REGEX
     * ~2.7x faster than WordBreaker.split(content).length
     * @param content - string to break and count
    */
    function wordCount(content: string): number;
    function getMaxWordWidth(content: string, textWidthMeasurer: ITextAsSVGMeasurer, properties: TextProperties): number;
    /**
     * Split content by breakers (words) and greedy fit as many words
     * into each index in the result based on max width and number of lines
     * e.g. Each index in result corresponds to a line of content
     *      when used by AxisHelper.LabelLayoutStrategy.wordBreak
     * @param content - string to split
     * @param properties - text properties to be used by @param:textWidthMeasurer
     * @param textWidthMeasurer - function to calculate width of given text content
     * @param maxWidth - maximum allowed width of text content in each result
     * @param maxNumLines - maximum number of results we will allow, valid values must be greater than 0
     * @param truncator - (optional) if specified, used as a function to truncate content to a given width
    */
    function splitByWidth(content: string, properties: TextProperties, textWidthMeasurer: ITextAsSVGMeasurer, maxWidth: number, maxNumLines: number, truncator?: ITextTruncator): string[];
}
declare module powerbi.extensibility.utils.formatting {
    /** Enumeration of DateTimeUnits */
    enum DateTimeUnit {
        Year = 0,
        Month = 1,
        Week = 2,
        Day = 3,
        Hour = 4,
        Minute = 5,
        Second = 6,
        Millisecond = 7,
    }
    interface IFormattingService {
        /**
         * Formats the value using provided format expression and culture
         * @param value - value to be formatted and converted to string.
         * @param format - format to be applied. If undefined or empty then generic format is used.
         */
        formatValue(value: any, format?: string, cultureSelector?: string): string;
        /**
         * Replaces the indexed format tokens (for example {0:c2}) in the format string with the localized formatted arguments.
         * @param formatWithIndexedTokens - format string with a set of indexed format tokens.
         * @param args - array of values which should replace the tokens in the format string.
         * @param culture - localization culture. If undefined then the current culture is used.
         */
        format(formatWithIndexedTokens: string, args: any[], culture?: string): string;
        /** Gets a value indicating whether the specified format a standard numeric format specifier. */
        isStandardNumberFormat(format: string): boolean;
        /** Performs a custom format with a value override.  Typically used for custom formats showing scaled values. */
        formatNumberWithCustomOverride(value: number, format: string, nonScientificOverrideFormat: string): string;
        /** Gets the format string to use for dates in particular units. */
        dateFormatString(unit: DateTimeUnit): string;
    }
}
declare module powerbi.extensibility.utils.formatting {
    interface ITextMeasurer {
        (textElement: SVGTextElement): number;
    }
    interface ITextAsSVGMeasurer {
        (textProperties: TextProperties): number;
    }
    interface ITextTruncator {
        (properties: TextProperties, maxWidth: number): string;
    }
    interface TextProperties {
        text?: string;
        fontFamily: string;
        fontSize: string;
        fontWeight?: string;
        fontStyle?: string;
        fontVariant?: string;
        whiteSpace?: string;
    }
    module textMeasurementService {
        /**
         * Removes spanElement from DOM.
         */
        function removeSpanElement(): void;
        /**
         * This method measures the width of the text with the given SVG text properties.
         * @param textProperties The text properties to use for text measurement.
         * @param text The text to measure.
         */
        function measureSvgTextWidth(textProperties: TextProperties, text?: string): number;
        /**
         * This method return the rect with the given SVG text properties.
         * @param textProperties The text properties to use for text measurement.
         * @param text The text to measure.
         */
        function measureSvgTextRect(textProperties: TextProperties, text?: string): SVGRect;
        /**
         * This method measures the height of the text with the given SVG text properties.
         * @param textProperties The text properties to use for text measurement.
         * @param text The text to measure.
         */
        function measureSvgTextHeight(textProperties: TextProperties, text?: string): number;
        /**
         * This method returns the text Rect with the given SVG text properties.
         * @param {TextProperties} textProperties - The text properties to use for text measurement
         */
        function estimateSvgTextBaselineDelta(textProperties: TextProperties): number;
        /**
         * This method estimates the height of the text with the given SVG text properties.
         * @param {TextProperties} textProperties - The text properties to use for text measurement
         */
        function estimateSvgTextHeight(textProperties: TextProperties, tightFightForNumeric?: boolean): number;
        /**
         * This method measures the width of the svgElement.
         * @param svgElement The SVGTextElement to be measured.
         */
        function measureSvgTextElementWidth(svgElement: SVGTextElement): number;
        /**
         * This method fetches the text measurement properties of the given DOM element.
         * @param element The selector for the DOM Element.
         */
        function getMeasurementProperties(element: Element): TextProperties;
        /**
         * This method fetches the text measurement properties of the given SVG text element.
         * @param svgElement The SVGTextElement to be measured.
         */
        function getSvgMeasurementProperties(svgElement: SVGTextElement): TextProperties;
        /**
         * This method returns the width of a div element.
         * @param element The div element.
         */
        function getDivElementWidth(element: Element): string;
        /**
         * Compares labels text size to the available size and renders ellipses when the available size is smaller.
         * @param textProperties The text properties (including text content) to use for text measurement.
         * @param maxWidth The maximum width available for rendering the text.
         */
        function getTailoredTextOrDefault(textProperties: TextProperties, maxWidth: number): string;
        /**
         * Compares labels text size to the available size and renders ellipses when the available size is smaller.
         * @param textElement The SVGTextElement containing the text to render.
         * @param maxWidth The maximum width available for rendering the text.
         */
        function svgEllipsis(textElement: SVGTextElement, maxWidth: number): void;
        /**
         * Word break textContent of <text> SVG element into <tspan>s
         * Each tspan will be the height of a single line of text
         * @param textElement - the SVGTextElement containing the text to wrap
         * @param maxWidth - the maximum width available
         * @param maxHeight - the maximum height available (defaults to single line)
         * @param linePadding - (optional) padding to add to line height
         */
        function wordBreak(textElement: SVGTextElement, maxWidth: number, maxHeight: number, linePadding?: number): void;
        /**
         * Word break textContent of span element into <span>s
         * Each span will be the height of a single line of text
         * @param textElement - the element containing the text to wrap
         * @param maxWidth - the maximum width available
         * @param maxHeight - the maximum height available (defaults to single line)
         * @param linePadding - (optional) padding to add to line height
         */
        function wordBreakOverflowingText(textElement: any, maxWidth: number, maxHeight: number, linePadding?: number): void;
    }
}
declare module powerbi.extensibility.utils.formatting {
    /** dateUtils module provides DateTimeSequence with set of additional date manipulation routines */
    module dateUtils {
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
}
declare module powerbi.extensibility.utils.formatting {
    import DateTimeUnit = powerbi.extensibility.utils.formatting.DateTimeUnit;
    /** Repreasents the sequence of the dates/times */
    class DateTimeSequence {
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
}
declare module powerbi.extensibility.utils.formatting {
    interface DateFormat {
        value: Date;
        format: string;
    }
    /**
     * Translate .NET format into something supported by jQuery.Globalize.
     */
    function findDateFormat(value: Date, format: string, cultureName: string): DateFormat;
    /**
     * Translates unsupported .NET custom format expressions to the custom expressions supported by JQuery.Globalize.
     */
    function fixDateTimeFormat(format: string): string;
}
declare module powerbi.extensibility.utils.formatting.font {
    class FamilyInfo {
        families: string[];
        constructor(families: string[]);
        /**
         * Gets the first font "wf_" font family since it will always be loaded.
         */
        readonly family: string;
        /**
        * Gets the first font family that matches regex (if provided).
        * Default regex looks for "wf_" fonts which are always loaded.
        */
        getFamily(regex?: RegExp): string;
        /**
         * Gets the CSS string for the "font-family" CSS attribute.
         */
        readonly css: string;
        /**
         * Gets the CSS string for the "font-family" CSS attribute.
         */
        getCSS(): string;
    }
}
declare module powerbi.extensibility.utils.formatting.font {
    const fallbackFonts: string[];
    const Family: {
        light: FamilyInfo;
        semilight: FamilyInfo;
        regular: FamilyInfo;
        semibold: FamilyInfo;
        bold: FamilyInfo;
        lightSecondary: FamilyInfo;
        regularSecondary: FamilyInfo;
        boldSecondary: FamilyInfo;
    };
}
declare module powerbi.extensibility.utils.formatting {
    import IFormattingService = powerbi.extensibility.utils.formatting.IFormattingService;
    import DateTimeUnit = powerbi.extensibility.utils.formatting.DateTimeUnit;
    /** Culture interfaces. These match the Globalize library interfaces intentionally. */
    interface Culture {
        name: string;
        calendar: Calendar;
        calendars: CalendarDictionary;
        numberFormat: NumberFormatInfo;
    }
    interface Calendar {
        patterns: any;
        firstDay: number;
    }
    interface CalendarDictionary {
        [key: string]: Calendar;
    }
    interface NumberFormatInfo {
        decimals: number;
        groupSizes: number[];
        negativeInfinity: string;
        positiveInfinity: string;
    }
    /** Formatting Service */
    class FormattingService implements IFormattingService {
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
    module numberFormat {
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
    const formattingService: IFormattingService;
}
declare module powerbi.extensibility.utils.formatting {
    /** The system used to determine display units used during formatting */
    enum DisplayUnitSystemType {
        /** Default display unit system, which saves space by using units such as K, M, bn with PowerView rules for when to pick a unit. Suitable for chart axes. */
        Default = 0,
        /** A verbose display unit system that will only respect the formatting defined in the model. Suitable for explore mode single-value cards. */
        Verbose = 1,
        /**
         * A display unit system that uses units such as K, M, bn if we have at least one of those units (e.g. 0.9M is not valid as it's less than 1 million).
         * Suitable for dashboard tile cards
         */
        WholeUnits = 2,
        /**A display unit system that also contains Auto and None units for data labels*/
        DataLabels = 3,
    }
}
declare module powerbi.extensibility.utils.formatting {
    class DisplayUnit {
        value: number;
        title: string;
        labelFormat: string;
        applicableRangeMin: number;
        applicableRangeMax: number;
        project(value: number): number;
        reverseProject(value: number): number;
        isApplicableTo(value: number): boolean;
        isScaling(): boolean;
    }
    class DisplayUnitSystem {
        units: DisplayUnit[];
        displayUnit: DisplayUnit;
        private unitBaseValue;
        protected static UNSUPPORTED_FORMATS: RegExp;
        constructor(units?: DisplayUnit[]);
        readonly title: string;
        update(value: number): void;
        private findApplicableDisplayUnit(value);
        format(value: number, format: string, decimals?: number, trailingZeros?: boolean, cultureSelector?: string): string;
        isFormatSupported(format: string): boolean;
        isPercentageFormat(format: string): boolean;
        shouldRespectScalingUnit(format: string): boolean;
        getNumberOfDecimalsForFormatting(format: string, decimals?: number): number;
        isScalingUnit(): boolean;
        private formatHelper(options);
        /** Formats a single value by choosing an appropriate base for the DisplayUnitSystem before formatting. */
        formatSingleValue(value: number, format: string, decimals?: number, trailingZeros?: boolean, cultureSelector?: string): string;
        private shouldUseValuePrecision(value);
        protected isScientific(value: number): boolean;
        protected hasScientitifcFormat(format: string): boolean;
        protected supportsScientificFormat(format: string): boolean;
        protected shouldFallbackToScientific(value: number, format: string): boolean;
        protected getScientificFormat(data: number, format: string, decimals: number, trailingZeros: boolean): string;
    }
    /** Provides a unit system that is defined by formatting in the model, and is suitable for visualizations shown in single number visuals in explore mode. */
    class NoDisplayUnitSystem extends DisplayUnitSystem {
        constructor();
    }
    /** Provides a unit system that creates a more concise format for displaying values. This is suitable for most of the cases where
        we are showing values (chart axes) and as such it is the default unit system. */
    class DefaultDisplayUnitSystem extends DisplayUnitSystem {
        private static units;
        constructor(unitLookup: (exponent: number) => DisplayUnitSystemNames);
        format(data: number, format: string, decimals?: number, trailingZeros?: boolean, cultureSelector?: string): string;
        static reset(): void;
        private static getUnits(unitLookup);
    }
    /** Provides a unit system that creates a more concise format for displaying values, but only allows showing a unit if we have at least
        one of those units (e.g. 0.9M is not allowed since it's less than 1 million). This is suitable for cases such as dashboard tiles
        where we have restricted space but do not want to show partial units. */
    class WholeUnitsDisplayUnitSystem extends DisplayUnitSystem {
        private static units;
        constructor(unitLookup: (exponent: number) => DisplayUnitSystemNames);
        static reset(): void;
        private static getUnits(unitLookup);
        format(data: number, format: string, decimals?: number, trailingZeros?: boolean, cultureSelector?: string): string;
    }
    class DataLabelsDisplayUnitSystem extends DisplayUnitSystem {
        private static AUTO_DISPLAYUNIT_VALUE;
        private static NONE_DISPLAYUNIT_VALUE;
        protected static UNSUPPORTED_FORMATS: RegExp;
        private static units;
        constructor(unitLookup: (exponent: number) => DisplayUnitSystemNames);
        isFormatSupported(format: string): boolean;
        private static getUnits(unitLookup);
        format(data: number, format: string, decimals?: number, trailingZeros?: boolean, cultureSelector?: string): string;
    }
    interface DisplayUnitSystemNames {
        title: string;
        format: string;
    }
}
/**
 * Contains functions/constants to aid in text manupilation.
 */
declare module powerbi.extensibility.utils.formatting.textUtil {
    /**
     * Remove breaking spaces from given string and replace by none breaking space (&nbsp).
     */
    function removeBreakingSpaces(str: string): string;
    /**
     * Remove ellipses from a given string
     */
    function removeEllipses(str: string): string;
    /**
    * Replace every whitespace (0x20) with Non-Breaking Space (0xA0)
     * @param {string} txt String to replace White spaces
     * @returns Text after replcing white spaces
     */
    function replaceSpaceWithNBSP(txt: string): string;
}
declare module powerbi.extensibility.utils.formatting {
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
    import ValueTypeDescriptor = powerbi.ValueTypeDescriptor;
    import DisplayUnitSystemType = powerbi.extensibility.utils.formatting.DisplayUnitSystemType;
    import DisplayUnit = powerbi.extensibility.utils.formatting.DisplayUnit;
    import DisplayUnitSystemNames = powerbi.extensibility.utils.formatting.DisplayUnitSystemNames;
    import NumberFormat = powerbi.extensibility.utils.formatting.numberFormat;
    import DisplayUnitSystem = powerbi.extensibility.utils.formatting.DisplayUnitSystem;
    /**
     * Formats the value using provided format expression
     * @param value - value to be formatted and converted to string.
     * @param format - format to be applied if the number shouldn't be abbreviated.
     * If the number should be abbreviated this string is checked for special characters like $ or % if any
     */
    interface ICustomValueFormatter {
        (value: any, format?: string): string;
    }
    interface ICustomValueColumnFormatter {
        (value: any, column: DataViewMetadataColumn, formatStringProp: DataViewObjectPropertyIdentifier, nullsAreBlank?: boolean): string;
    }
    interface ValueFormatterOptions {
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
    interface IValueFormatter {
        format(value: any): string;
        displayUnit?: DisplayUnit;
        options?: ValueFormatterOptions;
    }
    /** Captures all locale-specific options used by the valueFormatter. */
    interface ValueFormatterLocalizationOptions {
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
    module valueFormatter {
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
}
