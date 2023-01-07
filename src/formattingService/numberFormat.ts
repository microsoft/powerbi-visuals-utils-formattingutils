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

/**
 * NumberFormat module contains the static methods for formatting the numbers.
 * It extends the Globalize functionality to support complete set of .NET
 * formatting expressions for numeric types including custom formats.
 */

/* eslint-disable no-useless-escape */
import { Globalize, GlobalizeNumberFormat } from "./../../globalize/globalize";
// powerbi.extensibility.utils.type
import { double as Double, regExpExtensions } from "powerbi-visuals-utils-typeutils";
// powerbi.extensibility.utils.formatting
import * as stringExtensions from "./../stringExtensions";
import * as formattingEncoder from "./formattingEncoder";
import { Culture, formattingService } from "./formattingService";

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
const ZeroPlaceholder = "0";
const DigitPlaceholder = "#";
const ExponentialFormatChar = "E";
const NumericPlaceholders = [ZeroPlaceholder, DigitPlaceholder];
const NumericPlaceholderRegex = new RegExp(NumericPlaceholders.join("|"), "g");

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

    const newFormat = "{0:" + numericFormat + "}";

    return baseFormat.replace("{0}", newFormat);
}

export function getNumericFormat(value: number, baseFormat: string): string {
    if (baseFormat == null)
        return baseFormat;

    if (hasFormatComponents(baseFormat)) {
        const {positive, negative, zero} = getComponents(baseFormat);

        if (value > 0)
            return getNumericFormatFromComponent(value, positive);
        else if (value === 0)
            return getNumericFormatFromComponent(value, zero);

        return getNumericFormatFromComponent(value, negative);
    }

    return getNumericFormatFromComponent(value, baseFormat);
}

function getNumericFormatFromComponent(value: number, format: string): string {
    const match = regExpExtensions.run(NumericFormatRegex, format);
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
        const {positive, negative, zero} = getComponents(baseFormat);
        const formats = [positive, negative, zero];
        for (let i = 0; i < formats.length; i++) {
            // Update format in formats array
            formats[i] = addDecimalsToFormatComponent(formats[i], decimals, trailingZeros);
        }

        return formats.join(NumberFormatComponentsDelimeter);
    }

    return addDecimalsToFormatComponent(baseFormat, decimals, trailingZeros);
}

function addDecimalsToFormatComponent(format: string, decimals: number, trailingZeros: boolean): string {
    decimals = Math.abs(decimals);

    if (decimals >= 0) {
        const literals: string[] = [];
        format = formattingEncoder.preserveLiterals(format, literals);

        const placeholder = trailingZeros ? ZeroPlaceholder : DigitPlaceholder;
        const decimalPlaceholders = stringExtensions.repeat(placeholder, Math.abs(decimals));

        const match = regExpExtensions.run(DecimalFormatRegex, format);
        if (match) {
            const beforeDecimal = format.substring(0, match.index);
            let formatDecimal = format.substring(match.index + 1, match[1].length + match.index + 1);
            const afterDecimal = format.substring(match.index + match[0].length);

            if (trailingZeros)
                // Use explicit decimals argument as placeholders
                formatDecimal = decimalPlaceholders;
            else {
                const decimalChange = decimalPlaceholders.length - formatDecimal.length;
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
    return formattingEncoder.removeLiterals(format).indexOf(NumberFormatComponentsDelimeter) !== -1;
}

export function getComponents(format: string): NumberFormatComponents {
    const signFormat: NumberFormatComponents = {
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
    const literals: string[] = [];
    format = formattingEncoder.preserveLiterals(format, literals);

    let signSpecificFormats = format.split(NumberFormatComponentsDelimeter);
    const formatCount = signSpecificFormats.length;

    if (formatCount > 1) {
        if (literals.length !== 0)
            signSpecificFormats = signSpecificFormats.map((signSpecificFormat: string) => formattingEncoder.restoreLiterals(signSpecificFormat, literals));

        signFormat.hasNegative = true;

        signFormat.positive = signFormat.zero = signSpecificFormats[0];
        signFormat.negative = signSpecificFormats[1];

        if (formatCount > 2)
            signFormat.zero = signSpecificFormats[2];
    }

    return signFormat;
}

let _lastCustomFormatMeta: NumericFormatMetadata;

// Evaluates if the value can be formatted using the NumberFormat
export function canFormat(value: any) {
    return typeof (value) === "number";
}

export function isStandardFormat(format: string): boolean {
    return StandardFormatRegex.test(format);
}

// Formats the number using specified format expression and culture
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

// Performs a custom format with a value override.  Typically used for custom formats showing scaled values.
export function formatWithCustomOverride(
    value: number,
    format: string,
    nonScientificOverrideFormat: string,
    culture: Culture
): string {

    return formatNumberCustom(value, format, culture, nonScientificOverrideFormat);
}

// Formats the number using standard format expression
function formatNumberStandard(value: number, format: string, culture: Culture): string {
    let result: string;
    let precision = <number>(format.length > 1 ? parseInt(format.substring(1, format.length), 10) : undefined);
    const numberFormatInfo = culture.numberFormat;
    const formatChar = format.charAt(0);
    const abs = Math.abs(value);
    switch (formatChar) {
        case "e":
        case "E":
            if (precision === undefined) {
                precision = 6;
            }
            format = "0." + stringExtensions.repeat("0", precision) + formatChar + "+000";
            result = formatNumberCustom(value, format, culture);
            break;
        case "f":
        case "F":
            result = precision !== undefined ? value.toFixed(precision) : value.toFixed(numberFormatInfo.decimals);
            result = localize(result, numberFormatInfo);
            break;
        case "g":
        case "G":
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
                const isNegative = value < 0;
                if (isNegative) {
                    actualPrecision--;
                }
                const paddingZerosCount = precision - actualPrecision;
                let paddingZeros = undefined;
                if (paddingZerosCount > 0) {
                    paddingZeros = stringExtensions.repeat("0", paddingZerosCount);
                }
                if (isNegative) {
                    result = "-" + paddingZeros + result.substring(1);
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

// Formats the number using custom format expression
function formatNumberCustom(
    value: number,
    format: string,
    culture: Culture,
    nonScientificOverrideFormat?: string
): string {
    let result: string;
    const numberFormatInfo = culture.numberFormat;
    if (isFinite(value)) {
        // Split format by positive[;negative;zero] pattern
        const formatComponents = getComponents(format);
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
        const formatMeta = getCustomFormatMetadata(format, true /*calculatePrecision*/);
        // Preserve literals and escaped chars
        const literals: string[] = [];
        if (formatMeta.hasLiterals) {
            format = formattingEncoder.preserveLiterals(format, literals);
        }

        // Scientific format
        if (formatMeta.hasE && !nonScientificOverrideFormat) {
            const scientificMatch = regExpExtensions.run(ScientificFormatRegex, format);
            if (scientificMatch) {
                // Case 2.1. Scientific custom format
                const formatM = format.substring(0, scientificMatch.index);
                const formatE = format.substring(scientificMatch.index + 2); // E(+|-)
                const precision = getCustomFormatPrecision(formatM, formatMeta);
                const scale = getCustomFormatScale(formatM, formatMeta);
                if (scale !== 1) {
                    value = value * scale;
                }
                // Assert that value is a number and fall back on returning value if it is not
                if (typeof (value) !== "number")
                    return String(value);
                const s = value.toExponential(precision);
                const indexOfE = s.indexOf("e");
                const mantissa = s.substring(0, indexOfE);
                const exp = s.substring(indexOfE + 1);
                const resultM = fuseNumberWithCustomFormat(mantissa, formatM, numberFormatInfo);
                let resultE = fuseNumberWithCustomFormat(exp, formatE, numberFormatInfo);
                if (resultE.charAt(0) === "+" && scientificMatch[0].charAt(1) !== "+") {
                    resultE = resultE.substring(1);
                }
                const e = scientificMatch[0].charAt(0);
                result = resultM + e + resultE;
            }
        }

        // Non scientific format
        if (result === undefined) {
            let valueFormatted: string;
            let isValueGlobalized: boolean = false;
            const precision = getCustomFormatPrecision(format, formatMeta);
            const scale = getCustomFormatScale(format, formatMeta);

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
                const numericFormat = getNumericFormat(value, format);

                // Add separators and decimalFormat to nonScientificFormat
                nonScientificOverrideFormat = getNonScientificFormatWithPrecision(nonScientificOverrideFormat, numericFormat);

                // Format the value
                valueFormatted = formattingService.format(nonScientificOverrideFormat, [value], culture.name);
                isValueGlobalized = true;
            }
            else
                valueFormatted = toNonScientific(value, precision);

            result = fuseNumberWithCustomFormat(valueFormatted, format, <any>numberFormatInfo, nonScientificOverrideFormat, isValueGlobalized);
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

// Returns string with the fixed point respresentation of the number
function toNonScientific(value: number, precision: number): string {
    let result = "";
    let precisionZeros = 0;
    // Double precision numbers support actual 15-16 decimal digits of precision.
    if (precision > 16) {
        precisionZeros = precision - 16;
        precision = 16;
    }
    const digitsBeforeDecimalPoint = Double.log10(Math.abs(value));
    if (digitsBeforeDecimalPoint < 16) {
        if (digitsBeforeDecimalPoint > 0) {
            const maxPrecision = 16 - digitsBeforeDecimalPoint;
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
        const indexOfE = result.indexOf("e");
        if (indexOfE > 0) {
            const indexOfDot = result.indexOf(".");
            const mantissa = result.substring(0, indexOfE);
            const exp = result.substring(indexOfE + 1);
            const powerZeros = parseInt(exp, 10) - (mantissa.length - indexOfDot - 1);
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

    const literals: string[] = [];
    const escaped = formattingEncoder.preserveLiterals(format, literals);

    const result: NumericFormatMetadata = {
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
        const c = escaped.charAt(i);
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
    const formatComponents = getComponents(format);

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

        const dotIndex = format.indexOf(".");
        if (dotIndex > -1) {
            const count = format.length;
            for (let i = dotIndex; i < count; i++) {
                const char = format.charAt(i);
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

// Returns the scale factor of the format based on the "%" and scaling "," chars in the format
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
            const char = format.charAt(i);
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

function fuseNumberWithCustomFormat(value: string, format: string, numberFormatInfo: any, nonScientificOverrideFormat?: string, isValueGlobalized?: boolean): string {
    const suppressModifyValue = !!nonScientificOverrideFormat;
    const formatParts = format.split(".", 2);
    if (formatParts.length === 2) {
        const wholeFormat = formatParts[0];
        const fractionFormat = formatParts[1];
        let displayUnit = "";

        // Remove display unit from value before splitting on "." as localized display units sometimes end with "."
        if (nonScientificOverrideFormat) {
            displayUnit = nonScientificOverrideFormat.replace(NumericalPlaceHolderRegex, "");
            value = value.replace(displayUnit, "");
        }

        const globalizedDecimalSeparator = numberFormatInfo["."];
        const decimalSeparator = isValueGlobalized ? globalizedDecimalSeparator : ".";
        const valueParts = value.split(decimalSeparator, 2);
        const wholeValue = valueParts.length === 1 ? valueParts[0] + displayUnit : valueParts[0];
        let fractionValue = valueParts.length === 2 ? valueParts[1] + displayUnit : "";
        fractionValue = fractionValue.replace(TrailingZerosRegex, "");

        const wholeFormattedValue = fuseNumberWithCustomFormatLeft(wholeValue, wholeFormat, numberFormatInfo, suppressModifyValue);
        const fractionFormattedValue = fuseNumberWithCustomFormatRight(fractionValue, fractionFormat, suppressModifyValue);

        if (fractionFormattedValue.fmtOnly || fractionFormattedValue.value === "")
            return wholeFormattedValue + fractionFormattedValue.value;

        return wholeFormattedValue + globalizedDecimalSeparator + fractionFormattedValue.value;
    }
    return fuseNumberWithCustomFormatLeft(value, format, numberFormatInfo, suppressModifyValue);
}

function fuseNumberWithCustomFormatLeft(value: string, format: string, numberFormatInfo: GlobalizeNumberFormat, suppressModifyValue?: boolean): string {
    const groupSymbolIndex = format.indexOf(",");
    const enableGroups = groupSymbolIndex > -1 && groupSymbolIndex < Math.max(format.lastIndexOf("0"), format.lastIndexOf("#")) && numberFormatInfo[","];
    let groupDigitCount = 0;
    let groupIndex = 0;
    const groupSizes = numberFormatInfo.groupSizes || [3];
    let groupSize = groupSizes[0];
    const groupSeparator = numberFormatInfo[","];
    let sign = "";
    const firstChar = value.charAt(0);
    if (firstChar === "+" || firstChar === "-") {
        sign = numberFormatInfo[firstChar];
        value = value.substring(1);
    }
    const isZero = value === "0";
    let result = "";
    let leftBuffer = "";
    let vi = value.length - 1;
    let fmtOnly = true;
    // Iterate through format chars and replace 0 and # with the digits from the value string
    for (let fi = format.length - 1; fi > -1; fi--) {
        const formatChar = format.charAt(fi);
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
                result = value.substring(0, vi + 1) + result;
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
    const formatLength = format.length;
    const valueLength = value.length;
    if (suppressModifyValue) {
        const lastChar = format.charAt(formatLength - 1);
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
        fmtOnly: boolean = true,
        vi = 0;
    for (let fi = 0; fi < formatLength; fi++) {
        const formatChar = format.charAt(fi);
        if (vi < valueLength) {
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
    const plus = dictionary["+"];
    const minus = dictionary["-"];
    const dot = dictionary["."];
    const comma = dictionary[","];
    if (plus === "+" && minus === "-" && dot === "." && comma === ",") {
        return value;
    }
    const count = value.length;
    let result = "";
    for (let i = 0; i < count; i++) {
        const char = value.charAt(i);
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