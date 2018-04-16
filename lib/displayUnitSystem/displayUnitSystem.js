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
import { numberFormat as NumberFormat, formattingService } from "./../formattingService/formattingService";
var Double = powerbi.extensibility.utils.type.Double;
// Constants
const maxExponent = 24;
const defaultScientificBigNumbersBoundary = 1E15;
const scientificSmallNumbersBoundary = 1E-4;
const PERCENTAGE_FORMAT = "%";
const SCIENTIFIC_FORMAT = "E+0";
const DEFAULT_SCIENTIFIC_FORMAT = "0.##" + SCIENTIFIC_FORMAT;
// Regular expressions
/**
 * This regex looks for strings that match one of the following conditions:
 *   - Optionally contain "0", "#", followed by a period, followed by at least one "0" or "#" (Ex. ###,000.###)
 *   - Contains at least one of "0", "#", or "," (Ex. ###,000)
 *   - Contain a "g" (indicates to use the general .NET numeric format string)
 * The entire string (start to end) must match, and the match is not case-sensitive.
 */
const SUPPORTED_SCIENTIFIC_FORMATS = /^([0\#,]*\.[0\#]+|[0\#,]+|g)$/i;
export class DisplayUnit {
    // Methods
    project(value) {
        if (this.value) {
            return Double.removeDecimalNoise(value / this.value);
        }
        else {
            return value;
        }
    }
    reverseProject(value) {
        if (this.value) {
            return value * this.value;
        }
        else {
            return value;
        }
    }
    isApplicableTo(value) {
        value = Math.abs(value);
        let precision = Double.getPrecision(value, 3);
        return Double.greaterOrEqualWithPrecision(value, this.applicableRangeMin, precision) && Double.lessWithPrecision(value, this.applicableRangeMax, precision);
    }
    isScaling() {
        return this.value > 1;
    }
}
export class DisplayUnitSystem {
    // Constructor
    constructor(units) {
        this.units = units ? units : [];
    }
    // Properties
    get title() {
        return this.displayUnit ? this.displayUnit.title : undefined;
    }
    // Methods
    update(value) {
        if (value === undefined)
            return;
        this.unitBaseValue = value;
        this.displayUnit = this.findApplicableDisplayUnit(value);
    }
    findApplicableDisplayUnit(value) {
        for (let unit of this.units) {
            if (unit.isApplicableTo(value))
                return unit;
        }
        return undefined;
    }
    format(value, format, decimals, trailingZeros, cultureSelector) {
        decimals = this.getNumberOfDecimalsForFormatting(format, decimals);
        let nonScientificFormat = "";
        if (this.isFormatSupported(format)
            && !this.hasScientitifcFormat(format)
            && this.isScalingUnit()
            && this.shouldRespectScalingUnit(format)) {
            value = this.displayUnit.project(value);
            nonScientificFormat = this.displayUnit.labelFormat;
        }
        return this.formatHelper({
            value,
            nonScientificFormat,
            format,
            decimals,
            trailingZeros,
            cultureSelector
        });
    }
    isFormatSupported(format) {
        return !DisplayUnitSystem.UNSUPPORTED_FORMATS.test(format);
    }
    isPercentageFormat(format) {
        return format && format.indexOf(PERCENTAGE_FORMAT) >= 0;
    }
    shouldRespectScalingUnit(format) {
        return true;
    }
    getNumberOfDecimalsForFormatting(format, decimals) {
        return decimals;
    }
    isScalingUnit() {
        return this.displayUnit && this.displayUnit.isScaling();
    }
    formatHelper(options) {
        let { value, nonScientificFormat, cultureSelector, format, decimals, trailingZeros } = options;
        // If the format is "general" and we want to override the number of decimal places then use the default numeric format string.
        if ((format === "g" || format === "G") && decimals != null) {
            format = "#,0.00";
        }
        format = NumberFormat.addDecimalsToFormat(format, decimals, trailingZeros);
        if (format && !formattingService.isStandardNumberFormat(format))
            return formattingService.formatNumberWithCustomOverride(value, format, nonScientificFormat, cultureSelector);
        if (!format) {
            format = "G";
        }
        if (!nonScientificFormat) {
            nonScientificFormat = "{0}";
        }
        let text = formattingService.formatValue(value, format, cultureSelector);
        return formattingService.format(nonScientificFormat, [text]);
    }
    /** Formats a single value by choosing an appropriate base for the DisplayUnitSystem before formatting. */
    formatSingleValue(value, format, decimals, trailingZeros, cultureSelector) {
        // Change unit base to a value appropriate for this value
        this.update(this.shouldUseValuePrecision(value) ? Double.getPrecision(value, 8) : value);
        return this.format(value, format, decimals, trailingZeros, cultureSelector);
    }
    shouldUseValuePrecision(value) {
        if (this.units.length === 0)
            return true;
        // Check if the value is big enough to have a valid unit by checking against the smallest unit (that it's value bigger than 1).
        let applicableRangeMin = 0;
        for (let i = 0; i < this.units.length; i++) {
            if (this.units[i].isScaling()) {
                applicableRangeMin = this.units[i].applicableRangeMin;
                break;
            }
        }
        return Math.abs(value) < applicableRangeMin;
    }
    isScientific(value) {
        return value < -defaultScientificBigNumbersBoundary || value > defaultScientificBigNumbersBoundary ||
            (-scientificSmallNumbersBoundary < value && value < scientificSmallNumbersBoundary && value !== 0);
    }
    hasScientitifcFormat(format) {
        return format && format.toUpperCase().indexOf("E") !== -1;
    }
    supportsScientificFormat(format) {
        if (format)
            return SUPPORTED_SCIENTIFIC_FORMATS.test(format);
        return true;
    }
    shouldFallbackToScientific(value, format) {
        return !this.hasScientitifcFormat(format)
            && this.supportsScientificFormat(format)
            && this.isScientific(value);
    }
    getScientificFormat(data, format, decimals, trailingZeros) {
        // Use scientific format outside of the range
        if (this.isFormatSupported(format) && this.shouldFallbackToScientific(data, format)) {
            let numericFormat = NumberFormat.getNumericFormat(data, format);
            if (decimals)
                numericFormat = NumberFormat.addDecimalsToFormat(numericFormat ? numericFormat : "0", Math.abs(decimals), trailingZeros);
            if (numericFormat)
                return numericFormat + SCIENTIFIC_FORMAT;
            else
                return DEFAULT_SCIENTIFIC_FORMAT;
        }
        return format;
    }
}
DisplayUnitSystem.UNSUPPORTED_FORMATS = /^(p\d*)|(e\d*)$/i;
/** Provides a unit system that is defined by formatting in the model, and is suitable for visualizations shown in single number visuals in explore mode. */
export class NoDisplayUnitSystem extends DisplayUnitSystem {
    // Constructor
    constructor() {
        super([]);
    }
}
/** Provides a unit system that creates a more concise format for displaying values. This is suitable for most of the cases where
    we are showing values (chart axes) and as such it is the default unit system. */
export class DefaultDisplayUnitSystem extends DisplayUnitSystem {
    // Constructor
    constructor(unitLookup) {
        super(DefaultDisplayUnitSystem.getUnits(unitLookup));
    }
    // Methods
    format(data, format, decimals, trailingZeros, cultureSelector) {
        format = this.getScientificFormat(data, format, decimals, trailingZeros);
        return super.format(data, format, decimals, trailingZeros, cultureSelector);
    }
    static reset() {
        DefaultDisplayUnitSystem.units = null;
    }
    static getUnits(unitLookup) {
        if (!DefaultDisplayUnitSystem.units) {
            DefaultDisplayUnitSystem.units = createDisplayUnits(unitLookup, (value, previousUnitValue, min) => {
                // When dealing with millions/billions/trillions we need to switch to millions earlier: for example instead of showing 100K 200K 300K we should show 0.1M 0.2M 0.3M etc
                if (value - previousUnitValue >= 1000) {
                    return value / 10;
                }
                return min;
            });
            // Ensure last unit has max of infinity
            DefaultDisplayUnitSystem.units[DefaultDisplayUnitSystem.units.length - 1].applicableRangeMax = Infinity;
        }
        return DefaultDisplayUnitSystem.units;
    }
}
/** Provides a unit system that creates a more concise format for displaying values, but only allows showing a unit if we have at least
    one of those units (e.g. 0.9M is not allowed since it's less than 1 million). This is suitable for cases such as dashboard tiles
    where we have restricted space but do not want to show partial units. */
export class WholeUnitsDisplayUnitSystem extends DisplayUnitSystem {
    // Constructor
    constructor(unitLookup) {
        super(WholeUnitsDisplayUnitSystem.getUnits(unitLookup));
    }
    static reset() {
        WholeUnitsDisplayUnitSystem.units = null;
    }
    static getUnits(unitLookup) {
        if (!WholeUnitsDisplayUnitSystem.units) {
            WholeUnitsDisplayUnitSystem.units = createDisplayUnits(unitLookup);
            // Ensure last unit has max of infinity
            WholeUnitsDisplayUnitSystem.units[WholeUnitsDisplayUnitSystem.units.length - 1].applicableRangeMax = Infinity;
        }
        return WholeUnitsDisplayUnitSystem.units;
    }
    format(data, format, decimals, trailingZeros, cultureSelector) {
        format = this.getScientificFormat(data, format, decimals, trailingZeros);
        return super.format(data, format, decimals, trailingZeros, cultureSelector);
    }
}
export class DataLabelsDisplayUnitSystem extends DisplayUnitSystem {
    constructor(unitLookup) {
        super(DataLabelsDisplayUnitSystem.getUnits(unitLookup));
    }
    isFormatSupported(format) {
        return !DataLabelsDisplayUnitSystem.UNSUPPORTED_FORMATS.test(format);
    }
    static getUnits(unitLookup) {
        if (!DataLabelsDisplayUnitSystem.units) {
            let units = [];
            let adjustMinBasedOnPreviousUnit = (value, previousUnitValue, min) => {
                // Never returns true, we are always ignoring
                // We do not early switch (e.g. 100K instead of 0.1M)
                // Intended? If so, remove this function, otherwise, remove if statement
                if (value === -1)
                    if (value - previousUnitValue >= 1000) {
                        return value / 10;
                    }
                return min;
            };
            // Add Auto & None
            let names = unitLookup(-1);
            addUnitIfNonEmpty(units, DataLabelsDisplayUnitSystem.AUTO_DISPLAYUNIT_VALUE, names.title, names.format, adjustMinBasedOnPreviousUnit);
            names = unitLookup(0);
            addUnitIfNonEmpty(units, DataLabelsDisplayUnitSystem.NONE_DISPLAYUNIT_VALUE, names.title, names.format, adjustMinBasedOnPreviousUnit);
            // Add normal units
            DataLabelsDisplayUnitSystem.units = units.concat(createDisplayUnits(unitLookup, adjustMinBasedOnPreviousUnit));
            // Ensure last unit has max of infinity
            DataLabelsDisplayUnitSystem.units[DataLabelsDisplayUnitSystem.units.length - 1].applicableRangeMax = Infinity;
        }
        return DataLabelsDisplayUnitSystem.units;
    }
    format(data, format, decimals, trailingZeros, cultureSelector) {
        format = this.getScientificFormat(data, format, decimals, trailingZeros);
        return super.format(data, format, decimals, trailingZeros, cultureSelector);
    }
}
// Constants
DataLabelsDisplayUnitSystem.AUTO_DISPLAYUNIT_VALUE = 0;
DataLabelsDisplayUnitSystem.NONE_DISPLAYUNIT_VALUE = 1;
DataLabelsDisplayUnitSystem.UNSUPPORTED_FORMATS = /^(e\d*)$/i;
function createDisplayUnits(unitLookup, adjustMinBasedOnPreviousUnit) {
    let units = [];
    for (let i = 3; i < maxExponent; i++) {
        let names = unitLookup(i);
        if (names)
            addUnitIfNonEmpty(units, Double.pow10(i), names.title, names.format, adjustMinBasedOnPreviousUnit);
    }
    return units;
}
function addUnitIfNonEmpty(units, value, title, labelFormat, adjustMinBasedOnPreviousUnit) {
    if (title || labelFormat) {
        let min = value;
        if (units.length > 0) {
            let previousUnit = units[units.length - 1];
            if (adjustMinBasedOnPreviousUnit)
                min = adjustMinBasedOnPreviousUnit(value, previousUnit.value, min);
            previousUnit.applicableRangeMax = min;
        }
        let unit = new DisplayUnit();
        unit.value = value;
        unit.applicableRangeMin = min;
        unit.applicableRangeMax = min * 1000;
        unit.title = title;
        unit.labelFormat = labelFormat;
        units.push(unit);
    }
}
//# sourceMappingURL=displayUnitSystem.js.map