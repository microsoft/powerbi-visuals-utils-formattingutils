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
 * DateTimeFormat module contains the static methods for formatting the DateTimes.
 * It extends the Globalize functionality to support complete set of .NET
 * formatting expressions for dates.
 */

import { Culture } from "./formattingService";
import { findDateFormat, fixDateTimeFormat } from "./../formatting";
import * as formattingEncoder from "./formattingEncoder";
import * as stringExtensions from "./../stringExtensions";

import { Globalize, GlobalizeCalendar } from "./../../globalize/globalize";
let _currentCachedFormat: string;
let _currentCachedProcessedFormat: string;

// Evaluates if the value can be formatted using the NumberFormat
export function canFormat(value: any) {
    return value instanceof Date;
}

// Formats the date using provided format and culture
export function format(value: Date, format: string, culture: Culture): string {
    format = format || "G";
    const isStandard = format.length === 1;
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

// Formats the date using standard format expression
function formatDateStandard(value: Date, format: string, culture: Culture) {
    // In order to provide parity with .NET we have to support additional set of DateTime patterns.
    const patterns = culture.calendar.patterns;
    // Extend supported set of patterns
    ensurePatterns(culture.calendar);
    // Handle extended set of formats
    const output = findDateFormat(value, format, culture.name);
    if (output.format.length === 1)
        format = patterns[output.format];
    else
        format = output.format;
    // need to revisit when globalization is enabled
    if (!culture) {
        culture = this.getCurrentCulture();
    }
    return Globalize.format(output.value, format, culture);
}

// Formats the date using custom format expression
function formatDateCustom(value: Date, format: string, culture: Culture): string {
    let result: string;
    const literals: string[] = [];
    format = formattingEncoder.preserveLiterals(format, literals);
    if (format.indexOf("F") > -1) {
        // F is not supported so we need to replace the F with f based on the milliseconds
        // Replace all sequences of F longer than 3 with "FFF"
        format = stringExtensions.replaceAll(format, "FFFF", "FFF");
        // Based on milliseconds update the format to use fff
        const milliseconds = value.getMilliseconds();
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

// Translates unsupported .NET custom format expressions to the custom expressions supported by JQuery.Globalize
function processCustomDateTimeFormat(format: string): string {
    if (format === _currentCachedFormat) {
        return _currentCachedProcessedFormat;
    }
    _currentCachedFormat = format;
    format = fixDateTimeFormat(format);
    _currentCachedProcessedFormat = format;
    return format;
}

// Localizes the time separator symbol
function localize(value: string, dictionary: any): string {
    const timeSeparator = dictionary[":"];
    if (timeSeparator === ":") {
        return value;
    }
    let result = "";
    const count = value.length;
    for (let i = 0; i < count; i++) {
        const char = value.charAt(i);
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
    const patterns = calendar.patterns;
    if (patterns["g"] === undefined) {
        patterns["g"] = patterns["f"].replace(patterns["D"], patterns["d"]);  // Generic: Short date, short time
        patterns["G"] = patterns["F"].replace(patterns["D"], patterns["d"]);  // Generic: Short date, long time
    }
}