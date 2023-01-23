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
/* eslint-disable no-useless-escape */

import { Globalize } from "./../../globalize/globalize";
import injectCultures from "./../../globalize/globalize.cultures";
injectCultures(Globalize);

import * as dateTimeFormat from "./dateTimeFormat";
import * as numberFormat from "./numberFormat";
import * as formattingEncoder from "./formattingEncoder";

import { IFormattingService, DateTimeUnit } from "./iFormattingService";

// Culture interfaces. These match the Globalize library interfaces intentionally.
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

const IndexedTokensRegex = /({{)|(}})|{(\d+[^}]*)}/g;

// Formatting Service
export class FormattingService implements IFormattingService {
    private _currentCultureSelector: string;
    private _currentCulture: Culture;
    private _dateTimeScaleFormatInfo: DateTimeScaleFormatInfo;

    public formatValue(value: any, formatValue?: string, cultureSelector?: string): string {
        // Handle special cases
        if (value === undefined || value === null) {
            return "";
        }

        const gculture: Culture = this.getCulture(cultureSelector);

        if (dateTimeFormat.canFormat(value)) {
            // Dates
            return dateTimeFormat.format(value, formatValue, gculture);
        } else if (numberFormat.canFormat(value)) {
            // Numbers
            return numberFormat.format(value, formatValue, gculture);
        }

        // Other data types - return as string
        return value.toString();
    }

    public format(formatWithIndexedTokens: string, args: any[], culture?: string): string {
        if (!formatWithIndexedTokens) {
            return "";
        }
        return formatWithIndexedTokens.replace(IndexedTokensRegex, (match: string, left: string, right: string, argToken: string) => {
            if (left) {
                return "{";
            } else if (right) {
                return "}";
            } else {
                const parts = argToken.split(":");
                const argIndex = parseInt(parts[0], 10);
                const argFormat = parts[1];
                return this.formatValue(args[argIndex], argFormat, culture);
            }
        });
    }

    public isStandardNumberFormat(format: string): boolean {
        return numberFormat.isStandardFormat(format);
    }

    public formatNumberWithCustomOverride(value: number, format: string, nonScientificOverrideFormat: string, culture?: string): string {
        const gculture = this.getCulture(culture);

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

    // By default the Globalization module initializes to the culture/calendar provided in the language/culture URL params
    private initialize() {
        const cultureName = this.getCurrentCulture();
        this.setCurrentCulture(cultureName);
        const calendarName = this.getUrlParam("calendar");
        if (calendarName) {
            const culture = this._currentCulture;
            const c = culture.calendars[calendarName];
            if (c) {
                culture.calendar = c;
            }
        }
    }

    /**
     *  Exposing this function for testability
     */
    public getCurrentCulture(): string {
        if (window?.navigator){
            return (<any>window.navigator).userLanguage || window.navigator["language"]
        }

        return "en-US";
    }

    /**
     *  Exposing this function for testability
     *  @param name: queryString name
     */
    public getUrlParam(name: string): string {
        const param = window.location.search.match(RegExp("[?&]" + name + "=([^&]*)"));
        return param ? param[1] : undefined;
    }
}

// DateTimeScaleFormatInfo is used to calculate and keep the Date formats used for different units supported by the DateTimeScaleModel
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
        const calendar: Calendar = culture.calendar;
        const patterns: any = calendar.patterns;
        const monthAbbreviations: any = calendar["months"]["namesAbbr"];
        const cultureHasMonthAbbr: boolean = monthAbbreviations && monthAbbreviations[0];
        const yearMonthPattern: string = patterns["Y"];
        const monthDayPattern: string = patterns["M"];
        const fullPattern: string = patterns["f"];
        const longTimePattern: string = patterns["T"];
        const shortTimePattern: string = patterns["t"];
        const separator: string = fullPattern.indexOf(",") > -1 ? ", " : " ";

        const hasYearSymbol: boolean = yearMonthPattern.indexOf("yyyy'") === 0 && yearMonthPattern.length > 6 && yearMonthPattern[6] === "\'";
        this.YearPattern = hasYearSymbol ? yearMonthPattern.substring(0, 7) : "yyyy";

        const yearPos: number = fullPattern.indexOf("yy");
        const monthPos: number = fullPattern.indexOf("MMMM");
        this.MonthPattern = cultureHasMonthAbbr && monthPos > -1 ? (yearPos > monthPos ? "MMM yyyy" : "yyyy MMM") : yearMonthPattern;

        this.DayPattern = cultureHasMonthAbbr ? monthDayPattern.replace("MMMM", "MMM") : monthDayPattern;

        const minutePos: number = fullPattern.indexOf("mm");
        const pmPos: number = fullPattern.indexOf("tt");
        const shortHourPattern: string = pmPos > -1 ? shortTimePattern.replace(":mm ", "") : shortTimePattern;
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

const formattingService: IFormattingService = new FormattingService();
export { formattingService, numberFormat, dateTimeFormat, formattingEncoder}
