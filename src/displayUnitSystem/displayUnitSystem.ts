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

import { numberFormat as NumberFormat, formattingService}  from "./../formattingService/formattingService";

import { double as Double } from "powerbi-visuals-utils-typeutils";

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

export interface FormattingOptions {
    value: number;
    nonScientificFormat: string;
    cultureSelector: string;
    format: string;
    decimals?: number;
    trailingZeros?: boolean;
}

export class DisplayUnit {
    // Fields
    public value: number;
    public title: string;
    public labelFormat: string;
    public applicableRangeMin: number;
    public applicableRangeMax: number;

    // Methods
    public project(value: number): number {
        if (this.value) {
            return Double.removeDecimalNoise(value / this.value);
        } else {
            return value;
        }
    }

    public reverseProject(value: number): number {
        if (this.value) {
            return value * this.value;
        } else {
            return value;
        }
    }

    public isApplicableTo(value: number): boolean {
        value = Math.abs(value);
        let precision = Double.getPrecision(value, 3);
        return Double.greaterOrEqualWithPrecision(value, this.applicableRangeMin, precision) && Double.lessWithPrecision(value, this.applicableRangeMax, precision);
    }

    public isScaling(): boolean {
        return this.value > 1;
    }
}

export class DisplayUnitSystem {
    // Fields
    public units: DisplayUnit[];
    public displayUnit: DisplayUnit;
    private unitBaseValue: number;
    protected static UNSUPPORTED_FORMATS = /^(p\d*)|(e\d*)$/i;

    // Constructor
    constructor(units?: DisplayUnit[]) {
        this.units = units ? units : [];
    }

    // Properties
    public get title(): string {
        return this.displayUnit ? this.displayUnit.title : undefined;
    }

    // Methods
    public update(value: number): void {
        if (value === undefined)
            return;

        this.unitBaseValue = value;
        this.displayUnit = this.findApplicableDisplayUnit(value);
    }

    private findApplicableDisplayUnit(value: number): DisplayUnit {
        for (let unit of this.units) {
            if (unit.isApplicableTo(value))
                return unit;
        }

        return undefined;
    }

    public format(
        value: number,
        format: string,
        decimals?: number,
        trailingZeros?: boolean,
        cultureSelector?: string): string {

        decimals = this.getNumberOfDecimalsForFormatting(format, decimals);

        let nonScientificFormat: string = "";

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

    public isFormatSupported(format: string): boolean {
        return !DisplayUnitSystem.UNSUPPORTED_FORMATS.test(format);
    }

    public isPercentageFormat(format: string): boolean {
        return format && format.indexOf(PERCENTAGE_FORMAT) >= 0;
    }

    public shouldRespectScalingUnit(format: string): boolean {
        return true;
    }

    public getNumberOfDecimalsForFormatting(format: string, decimals?: number) {
        return decimals;
    }

    public isScalingUnit(): boolean {
        return this.displayUnit && this.displayUnit.isScaling();
    }

    private formatHelper(options: FormattingOptions) {
        let {
            value,
            nonScientificFormat,
            cultureSelector,
            format,
            decimals,
            trailingZeros
        } = options;

        // If the format is "general" and we want to override the number of decimal places then use the default numeric format string.
        if ((format === "g" || format === "G") && decimals != null) {
            format = "#,0.00";
        }

        format = NumberFormat.addDecimalsToFormat(format, decimals, trailingZeros);

        if (format && !formattingService.isStandardNumberFormat(format))
            return formattingService.formatNumberWithCustomOverride(
                value,
                format,
                nonScientificFormat,
                cultureSelector
        );

        if (!format) {
            format = "G";
        }

        if (!nonScientificFormat) {
            nonScientificFormat = "{0}";
        }

        let text: string = formattingService.formatValue(value, format, cultureSelector);

        return formattingService.format(nonScientificFormat, [text]);
    }

    //  Formats a single value by choosing an appropriate base for the DisplayUnitSystem before formatting.
    public formatSingleValue(
        value: number,
        format: string,
        decimals?: number,
        trailingZeros?: boolean,
        cultureSelector?: string): string {
        // Change unit base to a value appropriate for this value
        this.update(this.shouldUseValuePrecision(value) ? Double.getPrecision(value, 8) ?? 0 : value);

        return this.format(value, format, decimals, trailingZeros, cultureSelector);
    }

    private shouldUseValuePrecision(value: number): boolean {
        if (this.units.length === 0)
            return true;

        // Check if the value is big enough to have a valid unit by checking against the smallest unit (that it's value bigger than 1).
        let applicableRangeMin: number = 0;
        for (let i = 0; i < this.units.length; i++) {
            if (this.units[i].isScaling()) {
                applicableRangeMin = this.units[i].applicableRangeMin;
                break;
            }
        }

        return Math.abs(value) < applicableRangeMin;
    }

    protected isScientific(value: number): boolean {
        return value < - defaultScientificBigNumbersBoundary || value > defaultScientificBigNumbersBoundary ||
            (-scientificSmallNumbersBoundary < value && value < scientificSmallNumbersBoundary && value !== 0);
    }

    protected hasScientitifcFormat(format: string): boolean {
        return format && format.toUpperCase().indexOf("E") !== -1;
    }

    protected supportsScientificFormat(format: string): boolean {
        if (format)
            return SUPPORTED_SCIENTIFIC_FORMATS.test(format);

        return true;
    }

    protected shouldFallbackToScientific(value: number, format: string): boolean {
        return !this.hasScientitifcFormat(format)
            && this.supportsScientificFormat(format)
            && this.isScientific(value);
    }

    protected getScientificFormat(data: number, format: string, decimals: number, trailingZeros: boolean): string {
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

// Provides a unit system that is defined by formatting in the model, and is suitable for visualizations shown in single number visuals in explore mode.
export class NoDisplayUnitSystem extends DisplayUnitSystem {
    // Constructor
    constructor() {
        super([]);
    }
}

/** Provides a unit system that creates a more concise format for displaying values. This is suitable for most of the cases where
    we are showing values (chart axes) and as such it is the default unit system. */
export class DefaultDisplayUnitSystem extends DisplayUnitSystem {
    private static units: DisplayUnit[];

    // Constructor
    constructor(unitLookup: (exponent: number) => DisplayUnitSystemNames) {
        super(DefaultDisplayUnitSystem.getUnits(unitLookup));
    }

    // Methods
    public format(
        data: number,
        format: string,
        decimals?: number,
        trailingZeros?: boolean,
        cultureSelector?: string): string {

        format = this.getScientificFormat(data, format, decimals, trailingZeros);

        return super.format(data, format, decimals, trailingZeros, cultureSelector);
    }

    public static RESET(): void {
        DefaultDisplayUnitSystem.units = null;
    }

    private static getUnits(unitLookup: (exponent: number) => DisplayUnitSystemNames): DisplayUnit[] {
        if (!DefaultDisplayUnitSystem.units) {
            DefaultDisplayUnitSystem.units = createDisplayUnits(unitLookup, (value: number, previousUnitValue: number, min: number) => {
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
    private static units: DisplayUnit[];

    // Constructor
    constructor(unitLookup: (exponent: number) => DisplayUnitSystemNames) {
        super(WholeUnitsDisplayUnitSystem.getUnits(unitLookup));
    }

    public static RESET(): void {
        WholeUnitsDisplayUnitSystem.units = null;
    }

    private static getUnits(unitLookup: (exponent: number) => DisplayUnitSystemNames): DisplayUnit[] {
        if (!WholeUnitsDisplayUnitSystem.units) {
            WholeUnitsDisplayUnitSystem.units = createDisplayUnits(unitLookup);

            // Ensure last unit has max of infinity
            WholeUnitsDisplayUnitSystem.units[WholeUnitsDisplayUnitSystem.units.length - 1].applicableRangeMax = Infinity;
        }

        return WholeUnitsDisplayUnitSystem.units;
    }

    public format(
        data: number,
        format: string,
        decimals?: number,
        trailingZeros?: boolean,
        cultureSelector?: string): string {
        format = this.getScientificFormat(data, format, decimals, trailingZeros);

        return super.format(data, format, decimals, trailingZeros, cultureSelector);
    }
}

export class DataLabelsDisplayUnitSystem extends DisplayUnitSystem {

    // Constants
    private static AUTO_DISPLAYUNIT_VALUE = 0;
    private static NONE_DISPLAYUNIT_VALUE = 1;
    protected static UNSUPPORTED_FORMATS = /^(e\d*)$/i;

    private static units: DisplayUnit[];

    constructor(unitLookup: (exponent: number) => DisplayUnitSystemNames) {
        super(DataLabelsDisplayUnitSystem.getUnits(unitLookup));
    }

    public isFormatSupported(format: string): boolean {
        return !DataLabelsDisplayUnitSystem.UNSUPPORTED_FORMATS.test(format);
    }

    private static getUnits(unitLookup: (exponent: number) => DisplayUnitSystemNames): DisplayUnit[] {
        if (!DataLabelsDisplayUnitSystem.units) {
            let units = [];
            let adjustMinBasedOnPreviousUnit = (value: number, previousUnitValue: number, min: number): number => {
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

    public format(
        data: number,
        format: string,
        decimals?: number,
        trailingZeros?: boolean,
        cultureSelector?: string): string {
        format = this.getScientificFormat(data, format, decimals, trailingZeros);

        return super.format(data, format, decimals, trailingZeros, cultureSelector);
    }
}

export interface DisplayUnitSystemNames {
    title: string;
    format: string;
}

function createDisplayUnits(unitLookup: (exponent: number) => DisplayUnitSystemNames, adjustMinBasedOnPreviousUnit?: (value: number, previousUnitValue: number, min: number) => number) {
    let units = [];
    for (let i = 3; i < maxExponent; i++) {
        let names = unitLookup(i);
        if (names)
            addUnitIfNonEmpty(units, Double.pow10(i), names.title, names.format, adjustMinBasedOnPreviousUnit);
    }

    return units;
}

function addUnitIfNonEmpty(
    units: DisplayUnit[],
    value: number,
    title: string,
    labelFormat: string,
    adjustMinBasedOnPreviousUnit?: (value: number, previousUnitValue: number, min: number) => number): void {
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
