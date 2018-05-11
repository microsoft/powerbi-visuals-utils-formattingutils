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
import { DataLabelsDisplayUnitSystem, NoDisplayUnitSystem, WholeUnitsDisplayUnitSystem, DefaultDisplayUnitSystem } from "./displayUnitSystem/displayUnitSystem";
import { DisplayUnitSystemType } from "./displayUnitSystem/displayUnitSystemType";
import * as stringExtensions from "./stringExtensions";
import { numberFormat as NumberFormat, formattingService } from "./formattingService/formattingService";
import { DateTimeSequence } from "./date/dateTimeSequence";
import { double as Double, valueType } from "powerbi-visuals-utils-typeutils";
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";
var DataViewObjects = dataViewObjects.DataViewObjects;
// powerbi.extensibility.utils.type
var ValueType = valueType.ValueType;
var PrimitiveType = valueType.PrimitiveType;
export var valueFormatter;
(function (valueFormatter) {
    var StringExtensions = stringExtensions;
    const BeautifiedFormat = {
        "0.00 %;-0.00 %;0.00 %": "Percentage",
        "0.0 %;-0.0 %;0.0 %": "Percentage1",
    };
    valueFormatter.DefaultIntegerFormat = "g";
    valueFormatter.DefaultNumericFormat = "#,0.00";
    valueFormatter.DefaultDateFormat = "d";
    const defaultLocalizedStrings = {
        "NullValue": "(Blank)",
        "BooleanTrue": "True",
        "BooleanFalse": "False",
        "NaNValue": "NaN",
        "InfinityValue": "+Infinity",
        "NegativeInfinityValue": "-Infinity",
        "RestatementComma": "{0}, {1}",
        "RestatementCompoundAnd": "{0} and {1}",
        "RestatementCompoundOr": "{0} or {1}",
        "DisplayUnitSystem_EAuto_Title": "Auto",
        "DisplayUnitSystem_E0_Title": "None",
        "DisplayUnitSystem_E3_LabelFormat": "{0}K",
        "DisplayUnitSystem_E3_Title": "Thousands",
        "DisplayUnitSystem_E6_LabelFormat": "{0}M",
        "DisplayUnitSystem_E6_Title": "Millions",
        "DisplayUnitSystem_E9_LabelFormat": "{0}bn",
        "DisplayUnitSystem_E9_Title": "Billions",
        "DisplayUnitSystem_E12_LabelFormat": "{0}T",
        "DisplayUnitSystem_E12_Title": "Trillions",
        "Percentage": "#,0.##%",
        "Percentage1": "#,0.#%",
        "TableTotalLabel": "Total",
        "Tooltip_HighlightedValueDisplayName": "Highlighted",
        "Funnel_PercentOfFirst": "Percent of first",
        "Funnel_PercentOfPrevious": "Percent of previous",
        "Funnel_PercentOfFirst_Highlight": "Percent of first (highlighted)",
        "Funnel_PercentOfPrevious_Highlight": "Percent of previous (highlighted)",
        // Geotagging strings
        "GeotaggingString_Continent": "continent",
        "GeotaggingString_Continents": "continents",
        "GeotaggingString_Country": "country",
        "GeotaggingString_Countries": "countries",
        "GeotaggingString_State": "state",
        "GeotaggingString_States": "states",
        "GeotaggingString_City": "city",
        "GeotaggingString_Cities": "cities",
        "GeotaggingString_Town": "town",
        "GeotaggingString_Towns": "towns",
        "GeotaggingString_Province": "province",
        "GeotaggingString_Provinces": "provinces",
        "GeotaggingString_County": "county",
        "GeotaggingString_Counties": "counties",
        "GeotaggingString_Village": "village",
        "GeotaggingString_Villages": "villages",
        "GeotaggingString_Post": "post",
        "GeotaggingString_Zip": "zip",
        "GeotaggingString_Code": "code",
        "GeotaggingString_Place": "place",
        "GeotaggingString_Places": "places",
        "GeotaggingString_Address": "address",
        "GeotaggingString_Addresses": "addresses",
        "GeotaggingString_Street": "street",
        "GeotaggingString_Streets": "streets",
        "GeotaggingString_Longitude": "longitude",
        "GeotaggingString_Longitude_Short": "lon",
        "GeotaggingString_Longitude_Short2": "long",
        "GeotaggingString_Latitude": "latitude",
        "GeotaggingString_Latitude_Short": "lat",
        "GeotaggingString_PostalCode": "postal code",
        "GeotaggingString_PostalCodes": "postal codes",
        "GeotaggingString_ZipCode": "zip code",
        "GeotaggingString_ZipCodes": "zip codes",
        "GeotaggingString_Territory": "territory",
        "GeotaggingString_Territories": "territories",
    };
    function beautify(format) {
        let key = BeautifiedFormat[format];
        if (key)
            return defaultLocalizedStrings[key] || format;
        return format;
    }
    function describeUnit(exponent) {
        let exponentLookup = (exponent === -1) ? "Auto" : exponent.toString();
        let title = defaultLocalizedStrings["DisplayUnitSystem_E" + exponentLookup + "_Title"];
        let format = (exponent <= 0) ? "{0}" : defaultLocalizedStrings["DisplayUnitSystem_E" + exponentLookup + "_LabelFormat"];
        if (title || format)
            return { title: title, format: format };
    }
    function getLocalizedString(stringId) {
        return defaultLocalizedStrings[stringId];
    }
    valueFormatter.getLocalizedString = getLocalizedString;
    // NOTE: Define default locale options, but these can be overriden by setLocaleOptions.
    let localizationOptions = {
        nullValue: defaultLocalizedStrings["NullValue"],
        trueValue: defaultLocalizedStrings["BooleanTrue"],
        falseValue: defaultLocalizedStrings["BooleanFalse"],
        NaN: defaultLocalizedStrings["NaNValue"],
        infinity: defaultLocalizedStrings["InfinityValue"],
        negativeInfinity: defaultLocalizedStrings["NegativeInfinityValue"],
        beautify: format => beautify(format),
        describe: exponent => describeUnit(exponent),
        restatementComma: defaultLocalizedStrings["RestatementComma"],
        restatementCompoundAnd: defaultLocalizedStrings["RestatementCompoundAnd"],
        restatementCompoundOr: defaultLocalizedStrings["RestatementCompoundOr"],
    };
    const MaxScaledDecimalPlaces = 2;
    const MaxValueForDisplayUnitRounding = 1000;
    const MinIntegerValueForDisplayUnits = 10000;
    const MinPrecisionForDisplayUnits = 2;
    const DateTimeMetadataColumn = {
        displayName: "",
        type: ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.DateTime),
    };
    function getFormatMetadata(format) {
        return NumberFormat.getCustomFormatMetadata(format);
    }
    valueFormatter.getFormatMetadata = getFormatMetadata;
    function setLocaleOptions(options) {
        localizationOptions = options;
        DefaultDisplayUnitSystem.reset();
        WholeUnitsDisplayUnitSystem.reset();
    }
    valueFormatter.setLocaleOptions = setLocaleOptions;
    function createDefaultFormatter(formatString, allowFormatBeautification, cultureSelector) {
        const formatBeautified = allowFormatBeautification
            ? localizationOptions.beautify(formatString)
            : formatString;
        return {
            format: function (value) {
                if (value == null) {
                    return localizationOptions.nullValue;
                }
                return formatCore({
                    value,
                    cultureSelector,
                    format: formatBeautified
                });
            }
        };
    }
    valueFormatter.createDefaultFormatter = createDefaultFormatter;
    /** Creates an IValueFormatter to be used for a range of values. */
    function create(options) {
        const format = !!options.allowFormatBeautification
            ? localizationOptions.beautify(options.format)
            : options.format;
        const { cultureSelector } = options;
        if (shouldUseNumericDisplayUnits(options)) {
            let displayUnitSystem = createDisplayUnitSystem(options.displayUnitSystemType);
            let singleValueFormattingMode = !!options.formatSingleValues;
            displayUnitSystem.update(Math.max(Math.abs(options.value || 0), Math.abs(options.value2 || 0)));
            let forcePrecision = options.precision != null;
            let decimals;
            if (forcePrecision)
                decimals = -options.precision;
            else if (displayUnitSystem.displayUnit && displayUnitSystem.displayUnit.value > 1)
                decimals = -MaxScaledDecimalPlaces;
            return {
                format: function (value) {
                    let formattedValue = getStringFormat(value, true /*nullsAreBlank*/);
                    if (!StringExtensions.isNullOrUndefinedOrWhiteSpaceString(formattedValue)) {
                        return formattedValue;
                    }
                    // Round to Double.DEFAULT_PRECISION
                    if (value
                        && !displayUnitSystem.isScalingUnit()
                        && Math.abs(value) < MaxValueForDisplayUnitRounding
                        && !forcePrecision) {
                        value = Double.roundToPrecision(value);
                    }
                    return singleValueFormattingMode
                        ? displayUnitSystem.formatSingleValue(value, format, decimals, forcePrecision, cultureSelector)
                        : displayUnitSystem.format(value, format, decimals, forcePrecision, cultureSelector);
                },
                displayUnit: displayUnitSystem.displayUnit,
                options: options
            };
        }
        if (shouldUseDateUnits(options.value, options.value2, options.tickCount)) {
            const unit = DateTimeSequence.getIntervalUnit(options.value /* minDate */, options.value2 /* maxDate */, options.tickCount);
            return {
                format: function (value) {
                    if (value == null) {
                        return localizationOptions.nullValue;
                    }
                    let formatString = formattingService.dateFormatString(unit);
                    return formatCore({
                        value,
                        cultureSelector,
                        format: formatString,
                    });
                },
                options: options
            };
        }
        return createDefaultFormatter(format, false, cultureSelector);
    }
    valueFormatter.create = create;
    function format(value, format, allowFormatBeautification, cultureSelector) {
        if (value == null) {
            return localizationOptions.nullValue;
        }
        const formatString = !!allowFormatBeautification
            ? localizationOptions.beautify(format)
            : format;
        return formatCore({
            value,
            cultureSelector,
            format: formatString
        });
    }
    valueFormatter.format = format;
    /**
     * Value formatting function to handle variant measures.
     * For a Date/Time value within a non-date/time field, it's formatted with the default date/time formatString instead of as a number
     * @param {any} value Value to be formatted
     * @param {DataViewMetadataColumn} column Field which the value belongs to
     * @param {DataViewObjectPropertyIdentifier} formatStringProp formatString Property ID
     * @param {boolean} nullsAreBlank? Whether to show "(Blank)" instead of empty string for null values
     * @returns Formatted value
     */
    function formatVariantMeasureValue(value, column, formatStringProp, nullsAreBlank, cultureSelector) {
        // If column type is not datetime, but the value is of time datetime,
        // then use the default date format string
        if (!(column && column.type && column.type.dateTime) && value instanceof Date) {
            const valueFormat = getFormatString(DateTimeMetadataColumn, null, false);
            return formatCore({
                value,
                nullsAreBlank,
                cultureSelector,
                format: valueFormat
            });
        }
        else {
            const valueFormat = getFormatString(column, formatStringProp);
            return formatCore({
                value,
                nullsAreBlank,
                cultureSelector,
                format: valueFormat
            });
        }
    }
    valueFormatter.formatVariantMeasureValue = formatVariantMeasureValue;
    function createDisplayUnitSystem(displayUnitSystemType) {
        if (displayUnitSystemType == null)
            return new DefaultDisplayUnitSystem(localizationOptions.describe);
        switch (displayUnitSystemType) {
            case DisplayUnitSystemType.Default:
                return new DefaultDisplayUnitSystem(localizationOptions.describe);
            case DisplayUnitSystemType.WholeUnits:
                return new WholeUnitsDisplayUnitSystem(localizationOptions.describe);
            case DisplayUnitSystemType.Verbose:
                return new NoDisplayUnitSystem();
            case DisplayUnitSystemType.DataLabels:
                return new DataLabelsDisplayUnitSystem(localizationOptions.describe);
            default:
                return new DefaultDisplayUnitSystem(localizationOptions.describe);
        }
    }
    valueFormatter.createDisplayUnitSystem = createDisplayUnitSystem;
    function shouldUseNumericDisplayUnits(options) {
        let value = options.value;
        let value2 = options.value2;
        let format = options.format;
        // For singleValue visuals like card, gauge we don't want to roundoff data to the nearest thousands so format the whole number / integers below 10K to not use display units
        if (options.formatSingleValues && format) {
            if (Math.abs(value) < MinIntegerValueForDisplayUnits) {
                let isCustomFormat = !NumberFormat.isStandardFormat(format);
                if (isCustomFormat) {
                    let precision = NumberFormat.getCustomFormatMetadata(format, true /*calculatePrecision*/).precision;
                    if (precision < MinPrecisionForDisplayUnits)
                        return false;
                }
                else if (Double.isInteger(value))
                    return false;
            }
        }
        if ((typeof value === "number") || (typeof value2 === "number")) {
            return true;
        }
    }
    function shouldUseDateUnits(value, value2, tickCount) {
        // must check both value and value2 because we'll need to get an interval for date units
        return (value instanceof Date) && (value2 instanceof Date) && (tickCount !== undefined && tickCount !== null);
    }
    /*
        * Get the column format. Order of precendence is:
        *  1. Column format
        *  2. Default PowerView policy for column type
        */
    function getFormatString(column, formatStringProperty, suppressTypeFallback) {
        if (column) {
            if (formatStringProperty) {
                let propertyValue = DataViewObjects.getValue(column.objects, formatStringProperty);
                if (propertyValue)
                    return propertyValue;
            }
            if (!suppressTypeFallback) {
                let columnType = column.type;
                if (columnType) {
                    if (columnType.dateTime)
                        return valueFormatter.DefaultDateFormat;
                    if (columnType.integer) {
                        if (columnType.temporal && columnType.temporal.year)
                            return "0";
                        return valueFormatter.DefaultIntegerFormat;
                    }
                    if (columnType.numeric)
                        return valueFormatter.DefaultNumericFormat;
                }
            }
        }
    }
    valueFormatter.getFormatString = getFormatString;
    function getFormatStringByColumn(column, suppressTypeFallback) {
        if (column) {
            if (column.format) {
                return column.format;
            }
            if (!suppressTypeFallback) {
                let columnType = column.type;
                if (columnType) {
                    if (columnType.dateTime) {
                        return valueFormatter.DefaultDateFormat;
                    }
                    if (columnType.integer) {
                        if (columnType.temporal && columnType.temporal.year) {
                            return "0";
                        }
                        return valueFormatter.DefaultIntegerFormat;
                    }
                    if (columnType.numeric) {
                        return valueFormatter.DefaultNumericFormat;
                    }
                }
            }
        }
        return undefined;
    }
    valueFormatter.getFormatStringByColumn = getFormatStringByColumn;
    function formatListCompound(strings, conjunction) {
        let result;
        if (!strings) {
            return null;
        }
        let length = strings.length;
        if (length > 0) {
            result = strings[0];
            let lastIndex = length - 1;
            for (let i = 1, len = lastIndex; i < len; i++) {
                let value = strings[i];
                result = StringExtensions.format(localizationOptions.restatementComma, result, value);
            }
            if (length > 1) {
                let value = strings[lastIndex];
                result = StringExtensions.format(conjunction, result, value);
            }
        }
        else {
            result = null;
        }
        return result;
    }
    /** The returned string will look like 'A, B, ..., and C'  */
    function formatListAnd(strings) {
        return formatListCompound(strings, localizationOptions.restatementCompoundAnd);
    }
    valueFormatter.formatListAnd = formatListAnd;
    /** The returned string will look like 'A, B, ..., or C' */
    function formatListOr(strings) {
        return formatListCompound(strings, localizationOptions.restatementCompoundOr);
    }
    valueFormatter.formatListOr = formatListOr;
    function formatCore(options) {
        const { value, format, nullsAreBlank, cultureSelector } = options;
        let formattedValue = getStringFormat(value, nullsAreBlank ? nullsAreBlank : false);
        if (!StringExtensions.isNullOrUndefinedOrWhiteSpaceString(formattedValue)) {
            return formattedValue;
        }
        return formattingService.formatValue(value, format, cultureSelector);
    }
    function getStringFormat(value, nullsAreBlank) {
        if (value == null && nullsAreBlank) {
            return localizationOptions.nullValue;
        }
        if (value === true) {
            return localizationOptions.trueValue;
        }
        if (value === false) {
            return localizationOptions.falseValue;
        }
        if (typeof value === "number" && isNaN(value)) {
            return localizationOptions.NaN;
        }
        if (value === Number.NEGATIVE_INFINITY) {
            return localizationOptions.negativeInfinity;
        }
        if (value === Number.POSITIVE_INFINITY) {
            return localizationOptions.infinity;
        }
        return "";
    }
    function getDisplayUnits(displayUnitSystemType) {
        let displayUnitSystem = createDisplayUnitSystem(displayUnitSystemType);
        return displayUnitSystem.units;
    }
    valueFormatter.getDisplayUnits = getDisplayUnits;
})(valueFormatter || (valueFormatter = {}));
//# sourceMappingURL=valueFormatter.js.map