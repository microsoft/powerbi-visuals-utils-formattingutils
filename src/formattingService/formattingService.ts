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
    import Double = powerbi.extensibility.utils.type.Double;
    import RegExpExtensions = powerbi.extensibility.utils.type.RegExpExtensions;

    // powerbi.extensibility.utils.formatting
    import stringExtensions = powerbi.extensibility.utils.formatting.stringExtensions;
    import findDateFormat = powerbi.extensibility.utils.formatting.findDateFormat;
    import fixDateTimeFormat = powerbi.extensibility.utils.formatting.fixDateTimeFormat;
    import IFormattingService = powerbi.extensibility.utils.formatting.IFormattingService;
    import DateTimeUnit = powerbi.extensibility.utils.formatting.DateTimeUnit;

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

    /**
     *  Creating a dummy module to declare cultureInfo string, so we could do a strongly typed usage in Visuals
     */
    // declare module powerbi.common {
    //     let cultureInfo: string;
    // }

    /** Formatting Encoder */
    module formattingEncoder {
        // quoted and escaped literal patterns
        // NOTE: the final three cases match .NET behavior
        const literalPatterns: string[] = [
            "'[^']*'",      // single-quoted literal
            `"[^"]*"`,      // double-quoted literal
            "\\\\.",        // escaped character
            "'[^']*$",      // unmatched single-quote
            `"[^"]*$`,      // unmatched double-quote
            "\\\\$",        // backslash at end of string
        ];

        const literalMatcher = new RegExp(literalPatterns.join("|"), "g");

        // Unicode U+E000 - U+F8FF is a private area and so we can use the chars from the range to encode the escaped sequences

        export function removeLiterals(format: string): string {
            literalMatcher.lastIndex = 0;

            // just in case consecutive non-literals have some meaning
            return format.replace(literalMatcher, "\uE100");
        }

        export function preserveLiterals(format: string, literals: string[]): string {
            literalMatcher.lastIndex = 0;

            for (; ; ) {
                let match = literalMatcher.exec(format);
                if (!match)
                    break;

                let literal = match[0];
                let literalOffset = literalMatcher.lastIndex - literal.length;

                let token = String.fromCharCode(0xE100 + literals.length);

                literals.push(literal);

                format = format.substr(0, literalOffset) + token + format.substr(literalMatcher.lastIndex);

                // back to avoid skipping due to removed literal substring
                literalMatcher.lastIndex = literalOffset + 1;
            }

            return format;
        }

        export function restoreLiterals(format: string, literals: string[], quoted: boolean = true): string {
            let count = literals.length;
            for (let i = 0; i < count; i++) {
                let token = String.fromCharCode(0xE100 + i);
                let literal = literals[i];
                if (!quoted) {
                    // caller wants literals to be re-inserted without escaping
                    let firstChar = literal[0];
                    if (firstChar === "\\" || literal.length === 1 || literal[literal.length - 1] !== firstChar) {
                        // either escaped literal OR quoted literal that's missing the trailing quote
                        // in either case we only remove the leading character
                        literal = literal.substring(1);
                    }
                    else {
                        // so must be a quoted literal with both starting and ending quote
                        literal = literal.substring(1, literal.length - 1);
                    }
                }
                format = format.replace(token, literal);
            }
            return format;
        }
    }

    const IndexedTokensRegex = /({{)|(}})|{(\d+[^}]*)}/g;
    const ZeroPlaceholder = "0";
    const DigitPlaceholder = "#";
    const ExponentialFormatChar = "E";
    const NumericPlaceholders = [ZeroPlaceholder, DigitPlaceholder];
    const NumericPlaceholderRegex = new RegExp(NumericPlaceholders.join("|"), "g");

    /** Formatting Service */
    class FormattingService implements IFormattingService {

        _currentCultureSelector: string;
        _currentCulture: Culture;
        _dateTimeScaleFormatInfo: DateTimeScaleFormatInfo;

        public formatValue(value: any, format?: string, culture?: string): string {
            // Handle special cases
            if (value === undefined || value === null) {
                return "";
            }
            let gculture = this.getCulture(culture);

            if (dateTimeFormat.canFormat(value)) {
                // Dates
                return dateTimeFormat.format(value, format, gculture);
            } else if (numberFormat.canFormat(value)) {
                // Numbers
                return numberFormat.format(value, format, gculture);
            } else {
                // Other data types - return as string
                return value.toString();
            }
        }

        public format(formatWithIndexedTokens: string, args: any[], culture?: string): string {
            if (!formatWithIndexedTokens) {
                return "";
            }
            let result = formatWithIndexedTokens.replace(IndexedTokensRegex, (match: string, left: string, right: string, argToken: string) => {
                if (left) {
                    return "{";
                } else if (right) {
                    return "}";
                } else {
                    let parts = argToken.split(":");
                    let argIndex = parseInt(parts[0], 10);
                    let argFormat = parts[1];
                    return this.formatValue(args[argIndex], argFormat, culture);
                }
            });

            return result;
        }

        public isStandardNumberFormat(format: string): boolean {
            return numberFormat.isStandardFormat(format);
        }

        public formatNumberWithCustomOverride(value: number, format: string, nonScientificOverrideFormat: string, culture?: string): string {
            let gculture = this.getCulture(culture);

            return numberFormat.formatWithCustomOverride(value, format, nonScientificOverrideFormat, gculture);
        }

        public dateFormatString(unit: DateTimeUnit): string {
            if (!this._dateTimeScaleFormatInfo)
                this.initialize();
            return this._dateTimeScaleFormatInfo.getFormatString(unit);
        }

        /**
         * Sets the current localization culture
         * @param cultureSelector - name of a culture: "en", "en-UK", "fr-FR" etc. (See National Language Support (NLS) for full lists. Use "default" for invariant culture).
         */
        private setCurrentCulture(cultureSelector: string): void {
            if (this._currentCultureSelector !== cultureSelector) {
                this._currentCulture = this.getCulture(cultureSelector);
                this._currentCultureSelector = cultureSelector;
                this._dateTimeScaleFormatInfo = new DateTimeScaleFormatInfo(this._currentCulture);
            }
        }

        /**
         * Gets the culture assotiated with the specified cultureSelector ("en", "en-US", "fr-FR" etc).
         * @param cultureSelector - name of a culture: "en", "en-UK", "fr-FR" etc. (See National Language Support (NLS) for full lists. Use "default" for invariant culture).
         * Exposing this function for testability of unsupported cultures
         */
        public getCulture(cultureSelector?: string): Culture {
            if (cultureSelector == null) {
                if (this._currentCulture == null) {
                    this.initialize();
                }
                return this._currentCulture;
            } else {
                let culture = Globalize.findClosestCulture(cultureSelector);
                if (!culture)
                    culture = Globalize.culture("en-US");
                return culture;
            }
        }

        /** By default the Globalization module initializes to the culture/calendar provided in the language/culture URL params */
        private initialize() {
            let cultureName = this.getCurrentCulture();
            this.setCurrentCulture(cultureName);
            let calendarName = this.getUrlParam("calendar");
            if (calendarName) {
                let culture = this._currentCulture;
                let c = culture.calendars[calendarName];
                if (c) {
                    culture.calendar = c;
                }
            }
        }

        /**
         *  Exposing this function for testability 
         */
        public getCurrentCulture(): string {
            let urlParam = this.getUrlParam("language");

            if (urlParam) {
                return urlParam;
            }

            if (powerbi && (powerbi as any).common && ((powerbi as any).common as any).cultureInfo) {
                // Get cultureInfo set in powerbi
                return ((powerbi as any).common as any).cultureInfo;
            }

            return (<any>window.navigator).userLanguage || window.navigator["language"] || Globalize.culture().name;
        }

        /**
         *  Exposing this function for testability
         *  @param name: queryString name
         */
        public getUrlParam(name: string): string {
            let param = window.location.search.match(RegExp("[?&]" + name + "=([^&]*)"));
            return param ? param[1] : undefined;
        }
    }

    /**
     * DateTimeFormat module contains the static methods for formatting the DateTimes.
     * It extends the JQuery.Globalize functionality to support complete set of .NET
     * formatting expressions for dates.
     */
    module dateTimeFormat {

        let _currentCachedFormat: string;
        let _currentCachedProcessedFormat: string;

        /** Evaluates if the value can be formatted using the NumberFormat */
        export function canFormat(value: any) {
            let result = value instanceof Date;
            return result;
        }

        /** Formats the date using provided format and culture */
        export function format(value: Date, format: string, culture: Culture): string {
            format = format || "G";
            let isStandard = format.length === 1;
            try {
                if (isStandard) {
                    return formatDateStandard(value, format, culture);
                } else {
                    return formatDateCustom(value, format, culture);
                }
            } catch (e) {
                return formatDateStandard(value, "G", culture);
            }
        }

        /** Formats the date using standard format expression */
        function formatDateStandard(value: Date, format: string, culture: Culture) {
            // In order to provide parity with .NET we have to support additional set of DateTime patterns.
            let patterns = culture.calendar.patterns;
            // Extend supported set of patterns
            ensurePatterns(culture.calendar);
            // Handle extended set of formats
            let output = findDateFormat(value, format, culture.name);
            if (output.format.length === 1)
                format = patterns[output.format];
            else
                format = output.format;
            // need to revisit when globalization is enabled
            culture = Globalize.culture("en-US");
            return Globalize.format(output.value, format, culture);
        }

        /** Formats the date using custom format expression */
        function formatDateCustom(value: Date, format: string, culture: Culture): string {
            let result: string;
            let literals: string[] = [];
            format = formattingEncoder.preserveLiterals(format, literals);
            if (format.indexOf("F") > -1) {
                // F is not supported so we need to replace the F with f based on the milliseconds
                // Replace all sequences of F longer than 3 with "FFF"
                format = stringExtensions.replaceAll(format, "FFFF", "FFF");
                // Based on milliseconds update the format to use fff
                let milliseconds = value.getMilliseconds();
                if (milliseconds % 10 >= 1) {
                    format = stringExtensions.replaceAll(format, "FFF", "fff");
                }
                format = stringExtensions.replaceAll(format, "FFF", "FF");
                if ((milliseconds % 100) / 10 >= 1) {
                    format = stringExtensions.replaceAll(format, "FF", "ff");
                }
                format = stringExtensions.replaceAll(format, "FF", "F");
                if ((milliseconds % 1000) / 100 >= 1) {
                    format = stringExtensions.replaceAll(format, "F", "f");
                }
                format = stringExtensions.replaceAll(format, "F", "");
                if (format === "" || format === "%")
                    return "";
            }
            format = processCustomDateTimeFormat(format);
            result = Globalize.format(value, format, culture);
            result = localize(result, culture.calendar);
            result = formattingEncoder.restoreLiterals(result, literals, false);
            return result;
        }

        /** Translates unsupported .NET custom format expressions to the custom expressions supported by JQuery.Globalize */
        function processCustomDateTimeFormat(format: string): string {
            if (format === _currentCachedFormat) {
                return _currentCachedProcessedFormat;
            }
            _currentCachedFormat = format;
            format = fixDateTimeFormat(format);
            _currentCachedProcessedFormat = format;
            return format;
        }

        /** Localizes the time separator symbol */
        function localize(value: string, dictionary: any): string {
            let timeSeparator = dictionary[":"];
            if (timeSeparator === ":") {
                return value;
            }
            let result = "";
            let count = value.length;
            for (let i = 0; i < count; i++) {
                let char = value.charAt(i);
                switch (char) {
                    case ":":
                        result += timeSeparator;
                        break;
                    default:
                        result += char;
                        break;
                }
            }
            return result;
        }

        function ensurePatterns(calendar: GlobalizeCalendar) {
            let patterns = calendar.patterns;
            if (patterns["g"] === undefined) {
                patterns["g"] = patterns["f"].replace(patterns["D"], patterns["d"]);  // Generic: Short date, short time
                patterns["G"] = patterns["F"].replace(patterns["D"], patterns["d"]);  // Generic: Short date, long time
            }
        }

    }

    /**
     * NumberFormat module contains the static methods for formatting the numbers.
     * It extends the JQuery.Globalize functionality to support complete set of .NET
     * formatting expressions for numeric types including custom formats.
     */
    export module numberFormat {

        const NonScientificFormatRegex = /^\{.+\}.*/;
        const NumericalPlaceHolderRegex = /\{.+\}/;
        const ScientificFormatRegex = /e[+-]*[0#]+/i;
        const StandardFormatRegex = /^[a-z]\d{0,2}$/i; // a letter + up to 2 digits for precision specifier
        const TrailingZerosRegex = /0+$/;
        const DecimalFormatRegex = /\.([0#]*)/g;
        const NumericFormatRegex = /[0#,\.]+[0,#]*/g;
        // (?=...) is a positive lookahead assertion. The RE is asking for the last digit placeholder, [0#],
        // which is followed by non-digit placeholders and the end of string, [^0#]*$. But it only matches
        // the last digit placeholder, not anything that follows because the positive lookahead isn"t included
        // in the match - it is only a condition.
        const LastNumericPlaceholderRegex = /([0#])(?=[^0#]*$)/;
        const DecimalFormatCharacter = ".";

        export const NumberFormatComponentsDelimeter = ";";

        export interface NumericFormatMetadata {
            format: string;
            hasLiterals: boolean;
            hasE: boolean;
            hasCommas: boolean;
            hasDots: boolean;
            hasPercent: boolean;
            hasPermile: boolean;
            precision: number;
            scale: number;
            partsPerScale: number; // scale due to percent and per mille
        }

        export interface NumberFormatComponents {
            hasNegative: boolean;
            positive: string;
            negative: string;
            zero: string;
        }

        function getNonScientificFormatWithPrecision(baseFormat: string, numericFormat: string): string {
            if (!numericFormat || baseFormat === undefined)
                return baseFormat;

            let newFormat = "{0:" + numericFormat + "}";

            return baseFormat.replace("{0}", newFormat);
        }

        export function getNumericFormat(value: number, baseFormat: string): string {
            if (baseFormat == null)
                return baseFormat;

            if (hasFormatComponents(baseFormat)) {
                let {positive, negative, zero} = numberFormat.getComponents(baseFormat);

                if (value > 0)
                    return getNumericFormatFromComponent(value, positive);
                else if (value === 0)
                    return getNumericFormatFromComponent(value, zero);

                return getNumericFormatFromComponent(value, negative);
            }

            return getNumericFormatFromComponent(value, baseFormat);
        }

        function getNumericFormatFromComponent(value: number, format: string): string {
            let match = RegExpExtensions.run(NumericFormatRegex, format);
            if (match)
                return match[0];

            return format;
        }

        export function addDecimalsToFormat(baseFormat: string, decimals: number, trailingZeros: boolean): string {
            if (decimals == null)
                return baseFormat;

            // Default format string
            if (baseFormat == null)
                baseFormat = ZeroPlaceholder;

            if (hasFormatComponents(baseFormat)) {
                let {positive, negative, zero} = numberFormat.getComponents(baseFormat);
                let formats = [positive, negative, zero];
                for (let i = 0; i < formats.length; i++) {
                    // Update format in formats array
                    formats[i] = addDecimalsToFormatComponent(formats[i], decimals, trailingZeros);
                }

                return formats.join(numberFormat.NumberFormatComponentsDelimeter);
            }

            return addDecimalsToFormatComponent(baseFormat, decimals, trailingZeros);
        }

        function addDecimalsToFormatComponent(format: string, decimals: number, trailingZeros: boolean): string {
            decimals = Math.abs(decimals);

            if (decimals >= 0) {
                let literals: string[] = [];
                format = formattingEncoder.preserveLiterals(format, literals);

                let placeholder = trailingZeros ? ZeroPlaceholder : DigitPlaceholder;
                let decimalPlaceholders = stringExtensions.repeat(placeholder, Math.abs(decimals));

                let match = RegExpExtensions.run(DecimalFormatRegex, format);
                if (match) {
                    let beforeDecimal = format.substr(0, match.index);
                    let formatDecimal = format.substr(match.index + 1, match[1].length);
                    let afterDecimal = format.substr(match.index + match[0].length);

                    if (trailingZeros)
                        // Use explicit decimals argument as placeholders
                        formatDecimal = decimalPlaceholders;
                    else {
                        let decimalChange = decimalPlaceholders.length - formatDecimal.length;
                        if (decimalChange > 0)
                            // Append decimalPlaceholders to existing decimal portion of format string
                            formatDecimal = formatDecimal + decimalPlaceholders.slice(-decimalChange);
                        else if (decimalChange < 0)
                            // Remove decimals from formatDecimal
                            formatDecimal = formatDecimal.slice(0, decimalChange);
                    }

                    if (formatDecimal.length > 0)
                        formatDecimal = DecimalFormatCharacter + formatDecimal;

                    format = beforeDecimal + formatDecimal + afterDecimal;
                }
                else if (decimalPlaceholders.length > 0) {
                    // Replace last numeric placeholder with decimal portion
                    format = format.replace(LastNumericPlaceholderRegex, "$1" + DecimalFormatCharacter + decimalPlaceholders);
                }

                if (literals.length !== 0)
                    format = formattingEncoder.restoreLiterals(format, literals);
            }

            return format;
        }

        export function hasFormatComponents(format: string): boolean {
            return formattingEncoder.removeLiterals(format).indexOf(numberFormat.NumberFormatComponentsDelimeter) !== -1;
        }

        export function getComponents(format: string): NumberFormatComponents {
            let signFormat: NumberFormatComponents = {
                hasNegative: false,
                positive: format,
                negative: format,
                zero: format,
            };

            // escape literals so semi-colon in a literal isn't interpreted as a delimiter
            // NOTE: OK to use the literals extracted here for all three components before since the literals are indexed.
            // For example, "'pos-lit';'neg-lit'" will get preserved as "\uE000;\uE001" and the literal array will be
            // ['pos-lit', 'neg-lit']. When the negative components is restored, its \uE001 will select the second
            // literal.
            let literals: string[] = [];
            format = formattingEncoder.preserveLiterals(format, literals);

            let signSpecificFormats = format.split(NumberFormatComponentsDelimeter);
            let formatCount = signSpecificFormats.length;

            if (formatCount > 1) {
                if (literals.length !== 0)
                    signSpecificFormats = _.map(signSpecificFormats, signSpecificFormat => formattingEncoder.restoreLiterals(signSpecificFormat, literals));

                signFormat.hasNegative = true;

                signFormat.positive = signFormat.zero = signSpecificFormats[0];
                signFormat.negative = signSpecificFormats[1];

                if (formatCount > 2)
                    signFormat.zero = signSpecificFormats[2];
            }

            return signFormat;
        }

        let _lastCustomFormatMeta: NumericFormatMetadata;

        /** Evaluates if the value can be formatted using the NumberFormat */
        export function canFormat(value: any) {
            let result = typeof (value) === "number";
            return result;
        }

        export function isStandardFormat(format: string): boolean {
            return StandardFormatRegex.test(format);
        }

        /** Formats the number using specified format expression and culture */
        export function format(
            value: number,
            format: string,
            culture: Culture): string {
            format = format || "G";
            try {
                if (isStandardFormat(format))
                    return formatNumberStandard(value, format, culture);

                return formatNumberCustom(value, format, culture);
            } catch (e) {
                return Globalize.format(value, undefined, culture);
            }
        }

        /** Performs a custom format with a value override.  Typically used for custom formats showing scaled values. */
        export function formatWithCustomOverride(
            value: number,
            format: string,
            nonScientificOverrideFormat: string,
            culture: Culture): string {

            return formatNumberCustom(value, format, culture, nonScientificOverrideFormat);
        }

        /** Formats the number using standard format expression */
        function formatNumberStandard(value: number, format: string, culture: Culture): string {
            let result: string;
            let precision = <number>(format.length > 1 ? parseInt(format.substr(1, format.length - 1), 10) : undefined);
            let numberFormatInfo = culture.numberFormat;
            let formatChar = format.charAt(0);
            switch (formatChar) {
                case "e":
                case "E":
                    if (precision === undefined) {
                        precision = 6;
                    }
                    let mantissaDecimalDigits = stringExtensions.repeat("0", precision);
                    format = "0." + mantissaDecimalDigits + formatChar + "+000";
                    result = formatNumberCustom(value, format, culture);
                    break;
                case "f":
                case "F":
                    result = precision !== undefined ? value.toFixed(precision) : value.toFixed(numberFormatInfo.decimals);
                    result = localize(result, numberFormatInfo);
                    break;
                case "g":
                case "G":
                    let abs = Math.abs(value);
                    if (abs === 0 || (1E-4 <= abs && abs < 1E15)) {
                        // For the range of 0.0001 to 1,000,000,000,000,000 - use the normal form
                        result = precision !== undefined ? value.toPrecision(precision) : value.toString();
                    } else {
                        // Otherwise use exponential
                        // Assert that value is a number and fall back on returning value if it is not
                        if (typeof (value) !== "number")
                            return String(value);
                        result = precision !== undefined ? value.toExponential(precision) : value.toExponential();
                        result = result.replace("e", "E");
                    }
                    result = localize(result, numberFormatInfo);
                    break;
                case "r":
                case "R":
                    result = value.toString();
                    result = localize(result, numberFormatInfo);
                    break;
                case "x":
                case "X":
                    result = value.toString(16);
                    if (formatChar === "X") {
                        result = result.toUpperCase();
                    }
                    if (precision !== undefined) {
                        let actualPrecision = result.length;
                        let isNegative = value < 0;
                        if (isNegative) {
                            actualPrecision--;
                        }
                        let paddingZerosCount = precision - actualPrecision;
                        let paddingZeros = undefined;
                        if (paddingZerosCount > 0) {
                            paddingZeros = stringExtensions.repeat("0", paddingZerosCount);
                        }
                        if (isNegative) {
                            result = "-" + paddingZeros + result.substr(1);
                        } else {
                            result = paddingZeros + result;
                        }
                    }
                    result = localize(result, numberFormatInfo);
                    break;
                default:
                    result = Globalize.format(value, format, culture);
            }
            return result;
        }

        /** Formats the number using custom format expression */
        function formatNumberCustom(
            value: number,
            format: string,
            culture: Culture,
            nonScientificOverrideFormat?: string): string {
            let result: string;
            let numberFormatInfo = culture.numberFormat;
            if (isFinite(value)) {
                // Split format by positive[;negative;zero] pattern
                let formatComponents = getComponents(format);

                // Pick a format based on the sign of value
                if (value > 0) {
                    format = formatComponents.positive;
                } else if (value === 0) {
                    format = formatComponents.zero;
                } else {
                    format = formatComponents.negative;
                }

                // Normalize value if we have an explicit negative format
                if (formatComponents.hasNegative)
                    value = Math.abs(value);

                // Get format metadata
                let formatMeta = getCustomFormatMetadata(format, true /*calculatePrecision*/);

                // Preserve literals and escaped chars
                let literals: string[] = [];
                if (formatMeta.hasLiterals) {
                    format = formattingEncoder.preserveLiterals(format, literals);
                }

                // Scientific format
                if (formatMeta.hasE && !nonScientificOverrideFormat) {
                    let scientificMatch = RegExpExtensions.run(ScientificFormatRegex, format);
                    if (scientificMatch) {
                        // Case 2.1. Scientific custom format
                        let formatM = format.substr(0, scientificMatch.index);
                        let formatE = format.substr(scientificMatch.index + 2); // E(+|-)
                        let precision = getCustomFormatPrecision(formatM, formatMeta);
                        let scale = getCustomFormatScale(formatM, formatMeta);
                        if (scale !== 1) {
                            value = value * scale;
                        }
                        // Assert that value is a number and fall back on returning value if it is not
                        if (typeof (value) !== "number")
                            return String(value);
                        let s = value.toExponential(precision);
                        let indexOfE = s.indexOf("e");
                        let mantissa = s.substr(0, indexOfE);
                        let exp = s.substr(indexOfE + 1);
                        let resultM = fuseNumberWithCustomFormat(mantissa, formatM, numberFormatInfo);
                        let resultE = fuseNumberWithCustomFormat(exp, formatE, numberFormatInfo);
                        if (resultE.charAt(0) === "+" && scientificMatch[0].charAt(1) !== "+") {
                            resultE = resultE.substr(1);
                        }
                        let e = scientificMatch[0].charAt(0);
                        result = resultM + e + resultE;
                    }
                }

                // Non scientific format
                if (result === undefined) {
                    let valueFormatted: string;
                    let isValueGlobalized: boolean = false;
                    let precision = getCustomFormatPrecision(format, formatMeta);
                    let scale = getCustomFormatScale(format, formatMeta);

                    if (scale !== 1)
                        value = value * scale;

                    // Rounding
                    value = parseFloat(toNonScientific(value, precision));

                    if (!isFinite(value)) {
                        // very large and small finite values can become infinite by parseFloat(toNonScientific())
                        return Globalize.format(value, undefined);
                    }

                    if (nonScientificOverrideFormat) {
                        // Get numeric format from format string
                        let numericFormat = numberFormat.getNumericFormat(value, format);

                        // Add separators and decimalFormat to nonScientificFormat
                        nonScientificOverrideFormat = getNonScientificFormatWithPrecision(nonScientificOverrideFormat, numericFormat);

                        // Format the value
                        valueFormatted = formattingService.format(nonScientificOverrideFormat, [value], culture.name);
                        isValueGlobalized = true;
                    }
                    else
                        valueFormatted = toNonScientific(value, precision);

                    result = fuseNumberWithCustomFormat(valueFormatted, format, numberFormatInfo, nonScientificOverrideFormat, isValueGlobalized);
                }
                if (formatMeta.hasLiterals) {
                    result = formattingEncoder.restoreLiterals(result, literals, false);
                }

                _lastCustomFormatMeta = formatMeta;
            } else {
                return Globalize.format(value, undefined);
            }
            return result;
        }

        /** Returns string with the fixed point respresentation of the number */
        function toNonScientific(value: number, precision: number): string {
            let result = "";
            let precisionZeros = 0;
            // Double precision numbers support actual 15-16 decimal digits of precision.
            if (precision > 16) {
                precisionZeros = precision - 16;
                precision = 16;
            }
            let digitsBeforeDecimalPoint = Double.log10(Math.abs(value));
            if (digitsBeforeDecimalPoint < 16) {
                if (digitsBeforeDecimalPoint > 0) {
                    let maxPrecision = 16 - digitsBeforeDecimalPoint;
                    if (precision > maxPrecision) {
                        precisionZeros += precision - maxPrecision;
                        precision = maxPrecision;
                    }
                }
                result = value.toFixed(precision);
            } else if (digitsBeforeDecimalPoint === 16) {
                result = value.toFixed(0);
                precisionZeros += precision;
                if (precisionZeros > 0) {
                    result += ".";
                }
            } else { // digitsBeforeDecimalPoint > 16
                // Different browsers have different implementations of the toFixed().
                // In IE it returns fixed format no matter what's the number. In FF and Chrome the method returns exponential format for numbers greater than 1E21.
                // So we need to check for range and convert the to exponential with the max precision.
                // Then we convert exponential string to fixed by removing the dot and padding with "power" zeros.
                // Assert that value is a number and fall back on returning value if it is not
                if (typeof (value) !== "number")
                    return String(value);
                result = value.toExponential(15);
                let indexOfE = result.indexOf("e");
                if (indexOfE > 0) {
                    let indexOfDot = result.indexOf(".");
                    let mantissa = result.substr(0, indexOfE);
                    let exp = result.substr(indexOfE + 1);
                    let powerZeros = parseInt(exp, 10) - (mantissa.length - indexOfDot - 1);
                    result = mantissa.replace(".", "") + stringExtensions.repeat("0", powerZeros);
                    if (precision > 0) {
                        result = result + "." + stringExtensions.repeat("0", precision);
                    }
                }
            }
            if (precisionZeros > 0) {
                result = result + stringExtensions.repeat("0", precisionZeros);
            }
            return result;
        }

        /**
         * Returns the formatMetadata of the format
         * When calculating precision and scale, if format string of
         * positive[;negative;zero] => positive format will be used
         * @param (required) format - format string
         * @param (optional) calculatePrecision - calculate precision of positive format
         * @param (optional) calculateScale - calculate scale of positive format
         */
        export function getCustomFormatMetadata(format: string, calculatePrecision?: boolean, calculateScale?: boolean, calculatePartsPerScale?: boolean): NumericFormatMetadata {
            if (_lastCustomFormatMeta !== undefined && format === _lastCustomFormatMeta.format) {
                return _lastCustomFormatMeta;
            }

            let literals: string[] = [];
            let escaped = formattingEncoder.preserveLiterals(format, literals);

            let result: NumericFormatMetadata = {
                format: format,
                hasLiterals: literals.length !== 0,
                hasE: false,
                hasCommas: false,
                hasDots: false,
                hasPercent: false,
                hasPermile: false,
                precision: undefined,
                scale: undefined,
                partsPerScale: undefined,
            };

            for (let i = 0, length = escaped.length; i < length; i++) {
                let c = escaped.charAt(i);
                switch (c) {
                    case "e":
                    case "E":
                        result.hasE = true;
                        break;
                    case ",":
                        result.hasCommas = true;
                        break;
                    case ".":
                        result.hasDots = true;
                        break;
                    case "%":
                        result.hasPercent = true;
                        break;
                    case "\u2030":  // ‰
                        result.hasPermile = true;
                        break;
                }
            }

            // Use positive format for calculating these values
            let formatComponents = getComponents(format);

            if (calculatePrecision)
                result.precision = getCustomFormatPrecision(formatComponents.positive, result);
            if (calculatePartsPerScale)
                result.partsPerScale = getCustomFormatPartsPerScale(formatComponents.positive, result);
            if (calculateScale)
                result.scale = getCustomFormatScale(formatComponents.positive, result);

            return result;
        }

        /** Returns the decimal precision of format based on the number of # and 0 chars after the decimal point
          * Important: The input format string needs to be split to the appropriate pos/neg/zero portion to work correctly */
        function getCustomFormatPrecision(format: string, formatMeta: NumericFormatMetadata): number {
            if (formatMeta.precision > -1) {
                return formatMeta.precision;
            }
            let result = 0;
            if (formatMeta.hasDots) {
                if (formatMeta.hasLiterals) {
                    format = formattingEncoder.removeLiterals(format);
                }

                let dotIndex = format.indexOf(".");
                if (dotIndex > -1) {
                    let count = format.length;
                    for (let i = dotIndex; i < count; i++) {
                        let char = format.charAt(i);
                        if (char.match(NumericPlaceholderRegex))
                            result++;
                        // 0.00E+0 :: Break before counting 0 in
                        // exponential portion of format string
                        if (char === ExponentialFormatChar)
                            break;
                    }
                    result = Math.min(19, result);
                }
            }

            formatMeta.precision = result;
            return result;
        }

        function getCustomFormatPartsPerScale(format: string, formatMeta: NumericFormatMetadata): number {
            if (formatMeta.partsPerScale != null)
                return formatMeta.partsPerScale;

            let result = 1;
            if (formatMeta.hasPercent && format.indexOf("%") > -1) {
                result = result * 100;
            }
            if (formatMeta.hasPermile && format.indexOf(/* ‰ */ "\u2030") > -1) {
                result = result * 1000;
            }

            formatMeta.partsPerScale = result;

            return result;
        }

        /** Returns the scale factor of the format based on the "%" and scaling "," chars in the format */
        function getCustomFormatScale(format: string, formatMeta: NumericFormatMetadata): number {
            if (formatMeta.scale > -1) {
                return formatMeta.scale;
            }
            let result = getCustomFormatPartsPerScale(format, formatMeta);
            if (formatMeta.hasCommas) {
                let dotIndex = format.indexOf(".");
                if (dotIndex === -1) {
                    dotIndex = format.length;
                }
                for (let i = dotIndex - 1; i > -1; i--) {
                    let char = format.charAt(i);
                    if (char === ",") {
                        result = result / 1000;
                    } else {
                        break;
                    }
                }
            }
            formatMeta.scale = result;
            return result;
        }

        function fuseNumberWithCustomFormat(value: string, format: string, numberFormatInfo: GlobalizeNumberFormat, nonScientificOverrideFormat?: string, isValueGlobalized?: boolean): string {
            let suppressModifyValue = !!nonScientificOverrideFormat;
            let formatParts = format.split(".", 2);
            if (formatParts.length === 2) {
                let wholeFormat = formatParts[0];
                let fractionFormat = formatParts[1];
                let displayUnit = "";

                // Remove display unit from value before splitting on "." as localized display units sometimes end with "."
                if (nonScientificOverrideFormat) {
                    displayUnit = nonScientificOverrideFormat.replace(NumericalPlaceHolderRegex, "");
                    value = value.replace(displayUnit, "");
                }

                let globalizedDecimalSeparator = numberFormatInfo["."];
                let decimalSeparator = isValueGlobalized ? globalizedDecimalSeparator : ".";
                let valueParts = value.split(decimalSeparator, 2);
                let wholeValue = valueParts.length === 1 ? valueParts[0] + displayUnit : valueParts[0];
                let fractionValue = valueParts.length === 2 ? valueParts[1] + displayUnit : "";
                fractionValue = fractionValue.replace(TrailingZerosRegex, "");

                let wholeFormattedValue = fuseNumberWithCustomFormatLeft(wholeValue, wholeFormat, numberFormatInfo, suppressModifyValue);
                let fractionFormattedValue = fuseNumberWithCustomFormatRight(fractionValue, fractionFormat, suppressModifyValue);

                if (fractionFormattedValue.fmtOnly || fractionFormattedValue.value === "")
                    return wholeFormattedValue + fractionFormattedValue.value;

                return wholeFormattedValue + globalizedDecimalSeparator + fractionFormattedValue.value;
            }
            return fuseNumberWithCustomFormatLeft(value, format, numberFormatInfo, suppressModifyValue);
        }

        function fuseNumberWithCustomFormatLeft(value: string, format: string, numberFormatInfo: GlobalizeNumberFormat, suppressModifyValue?: boolean): string {
            let groupSymbolIndex = format.indexOf(",");
            let enableGroups = groupSymbolIndex > -1 && groupSymbolIndex < Math.max(format.lastIndexOf("0"), format.lastIndexOf("#")) && numberFormatInfo[","];
            let groupDigitCount = 0;
            let groupIndex = 0;
            let groupSizes = numberFormatInfo.groupSizes || [3];
            let groupSize = groupSizes[0];
            let groupSeparator = numberFormatInfo[","];
            let sign = "";
            let firstChar = value.charAt(0);
            if (firstChar === "+" || firstChar === "-") {
                sign = numberFormatInfo[firstChar];
                value = value.substr(1);
            }
            let isZero = value === "0";
            let result = "";
            let leftBuffer = "";
            let vi = value.length - 1;
            let fmtOnly = true;
            // Iterate through format chars and replace 0 and # with the digits from the value string
            for (let fi = format.length - 1; fi > -1; fi--) {
                let formatChar = format.charAt(fi);
                switch (formatChar) {
                    case ZeroPlaceholder:
                    case DigitPlaceholder:
                        fmtOnly = false;
                        if (leftBuffer !== "") {
                            result = leftBuffer + result;
                            leftBuffer = "";
                        }
                        if (!suppressModifyValue) {
                            if (vi > -1 || formatChar === ZeroPlaceholder) {
                                if (enableGroups) {
                                    // If the groups are enabled we'll need to keep track of the current group index and periodically insert group separator,
                                    if (groupDigitCount === groupSize) {
                                        result = groupSeparator + result;
                                        groupIndex++;
                                        if (groupIndex < groupSizes.length) {
                                            groupSize = groupSizes[groupIndex];
                                        }
                                        groupDigitCount = 1;
                                    } else {
                                        groupDigitCount++;
                                    }
                                }
                            }
                            if (vi > -1) {
                                if (isZero && formatChar === DigitPlaceholder) {
                                    // Special case - if we need to format a zero value and the # symbol is used - we don't copy it into the result)
                                } else {
                                    result = value.charAt(vi) + result;
                                }
                                vi--;
                            } else if (formatChar !== DigitPlaceholder) {
                                result = formatChar + result;
                            }
                        }
                        break;
                    case ",":
                        // We should skip all the , chars
                        break;
                    default:
                        leftBuffer = formatChar + leftBuffer;
                        break;
                }
            }

            // If the value didn't fit into the number of zeros provided in the format then we should insert the missing part of the value into the result
            if (!suppressModifyValue) {
                if (vi > -1 && result !== "") {
                    if (enableGroups) {
                        while (vi > -1) {
                            if (groupDigitCount === groupSize) {
                                result = groupSeparator + result;
                                groupIndex++;
                                if (groupIndex < groupSizes.length) {
                                    groupSize = groupSizes[groupIndex];
                                }
                                groupDigitCount = 1;
                            } else {
                                groupDigitCount++;
                            }
                            result = value.charAt(vi) + result;
                            vi--;
                        }
                    } else {
                        result = value.substr(0, vi + 1) + result;
                    }
                }
                // Insert sign in front of the leftBuffer and result
                return sign + leftBuffer + result;
            }

            if (fmtOnly)
                // If the format doesn't specify any digits to be displayed, then just return the format we've parsed up until now.
                return sign + leftBuffer + result;

            return sign + leftBuffer + value + result;
        }

        function fuseNumberWithCustomFormatRight(value: string, format: string, suppressModifyValue?: boolean): { value: string; fmtOnly?: boolean } {
            let vi = 0;
            let fCount = format.length;
            let vCount = value.length;

            if (suppressModifyValue) {
                let lastChar = format.charAt(fCount - 1);
                if (!lastChar.match(NumericPlaceholderRegex))
                    return {
                        value: value + lastChar,
                        fmtOnly: value === "",
                    };

                return {
                    value: value,
                    fmtOnly: value === "",
                };
            }

            let result = "",
                fmtOnly: boolean = true;
            for (let fi = 0; fi < fCount; fi++) {
                let formatChar = format.charAt(fi);
                if (vi < vCount) {
                    switch (formatChar) {
                        case ZeroPlaceholder:
                        case DigitPlaceholder:
                            result += value[vi++];
                            fmtOnly = false;
                            break;
                        default:
                            result += formatChar;
                    }
                } else {
                    if (formatChar !== DigitPlaceholder) {
                        result += formatChar;
                        fmtOnly = fmtOnly && (formatChar !== ZeroPlaceholder);
                    }
                }
            }

            return {
                value: result,
                fmtOnly: fmtOnly,
            };
        }

        function localize(value: string, dictionary: any): string {
            let plus = dictionary["+"];
            let minus = dictionary["-"];
            let dot = dictionary["."];
            let comma = dictionary[","];
            if (plus === "+" && minus === "-" && dot === "." && comma === ",") {
                return value;
            }
            let count = value.length;
            let result = "";
            for (let i = 0; i < count; i++) {
                let char = value.charAt(i);
                switch (char) {
                    case "+":
                        result = result + plus;
                        break;
                    case "-":
                        result = result + minus;
                        break;
                    case ".":
                        result = result + dot;
                        break;
                    case ",":
                        result = result + comma;
                        break;
                    default:
                        result = result + char;
                        break;
                }
            }
            return result;
        }

    }

    /** DateTimeScaleFormatInfo is used to calculate and keep the Date formats used for different units supported by the DateTimeScaleModel */
    class DateTimeScaleFormatInfo {

        // Fields
        public YearPattern: string;
        public MonthPattern: string;
        public DayPattern: string;
        public HourPattern: string;
        public MinutePattern: string;
        public SecondPattern: string;
        public MillisecondPattern: string;

        // Constructor
        /**
         * Creates new instance of the DateTimeScaleFormatInfo class.
         * @param culture - culture which calendar info is going to be used to derive the formats.
         */
        constructor(culture: Culture) {
            let calendar: Calendar = culture.calendar;
            let patterns: any = calendar.patterns;
            let monthAbbreviations: any = calendar["months"]["namesAbbr"];
            let cultureHasMonthAbbr: boolean = monthAbbreviations && monthAbbreviations[0];
            let yearMonthPattern: string = patterns["Y"];
            let monthDayPattern: string = patterns["M"];
            let fullPattern: string = patterns["f"];
            let longTimePattern: string = patterns["T"];
            let shortTimePattern: string = patterns["t"];
            let separator: string = fullPattern.indexOf(",") > -1 ? ", " : " ";

            let hasYearSymbol: boolean = yearMonthPattern.indexOf("yyyy'") === 0 && yearMonthPattern.length > 6 && yearMonthPattern[6] === "\'";
            this.YearPattern = hasYearSymbol ? yearMonthPattern.substr(0, 7) : "yyyy";

            let yearPos: number = fullPattern.indexOf("yy");
            let monthPos: number = fullPattern.indexOf("MMMM");
            this.MonthPattern = cultureHasMonthAbbr && monthPos > -1 ? (yearPos > monthPos ? "MMM yyyy" : "yyyy MMM") : yearMonthPattern;

            this.DayPattern = cultureHasMonthAbbr ? monthDayPattern.replace("MMMM", "MMM") : monthDayPattern;

            let minutePos: number = fullPattern.indexOf("mm");
            let pmPos: number = fullPattern.indexOf("tt");
            let shortHourPattern: string = pmPos > -1 ? shortTimePattern.replace(":mm ", "") : shortTimePattern;
            this.HourPattern = yearPos < minutePos ? this.DayPattern + separator + shortHourPattern : shortHourPattern + separator + this.DayPattern;

            this.MinutePattern = shortTimePattern;

            this.SecondPattern = longTimePattern;

            this.MillisecondPattern = longTimePattern.replace("ss", "ss.fff");

            // Special cases
            switch (culture.name) {
                case "fi-FI":
                    this.DayPattern = this.DayPattern.replace("'ta'", ""); // Fix for finish 'ta' suffix for month names.
                    this.HourPattern = this.HourPattern.replace("'ta'", "");
                    break;
            }
        }

        // Methods

        /**
         * Returns the format string of the provided DateTimeUnit.
         * @param unit - date or time unit
         */
        public getFormatString(unit: DateTimeUnit): string {
            switch (unit) {
                case DateTimeUnit.Year:
                    return this.YearPattern;
                case DateTimeUnit.Month:
                    return this.MonthPattern;
                case DateTimeUnit.Week:
                case DateTimeUnit.Day:
                    return this.DayPattern;
                case DateTimeUnit.Hour:
                    return this.HourPattern;
                case DateTimeUnit.Minute:
                    return this.MinutePattern;
                case DateTimeUnit.Second:
                    return this.SecondPattern;
                case DateTimeUnit.Millisecond:
                    return this.MillisecondPattern;
            }
        }
    }

    export var formattingService: IFormattingService = new FormattingService();
}
