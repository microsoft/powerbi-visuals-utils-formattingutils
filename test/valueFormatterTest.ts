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

import powerbi from "powerbi-visuals-api";
// powerbi
import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;

// powerbi.extensibility.utils.type
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;
import PrimitiveType = valueType.PrimitiveType;

// powerbi.extensibility.utils.formatting
import { DisplayUnitSystemType } from "./../src/displayUnitSystem/displayUnitSystemType";
import { valueFormatter } from "./../src/index";

describe("ValueFormatter", () => {

    describe("checkValueInBounds", () => {
        it("target is greater than bounds", () => {
            const res = valueFormatter.checkValueInBounds(5, -4, 4);
            expect(res).toBe(4);
        });

        it("target inside bounds", () => {
            const res = valueFormatter.checkValueInBounds(3, 0, 14);
            expect(res).toBe(3);
        });

        it("target is lesser that bounds", () => {
            const res = valueFormatter.checkValueInBounds(-3, 0, 14);
            expect(res).toBe(0);
        });

        it("target is lesser that bounds with lessMinReplacement as null", () => {
            const res = valueFormatter.checkValueInBounds(-3, 0, 14, null);
            expect(res).toBeNull();
        });

        it("max is undefined", () => {
            let res = valueFormatter.checkValueInBounds(5, -4, null);
            expect(res).toBe(5);

            res = valueFormatter.checkValueInBounds(5, -4, undefined);
            expect(res).toBe(5);

            res = valueFormatter.checkValueInBounds(-5, -4, null, null);
            expect(res).toBeNull();
        });

        it("min is undefined", () => {
            let res = valueFormatter.checkValueInBounds(5, null, 15);
            expect(res).toBe(5);

            res = valueFormatter.checkValueInBounds(5, undefined, 15);
            expect(res).toBe(5);

            res = valueFormatter.checkValueInBounds(-2, null, -3);
            expect(res).toBe(-3);
        });
    });

    describe("format", () => {
        it("format null", () => {
            expect(valueFormatter.format(null)).toBe("(Blank)");
        });

        it("format empty", () => {
            expect(valueFormatter.format("")).toBe("");
        });

        it("format non-null value", () => {
            let formatValue = valueFormatter.format(2010);
            expect(formatValue).not.toBeNull();
        });

        it("format 100 pct", () => {
            expect(valueFormatter.format(1, "0.00 %;-0.00 %;0.00 %", true)).toBe("100%");
        });

        it("format 100 pct - no beautify", () => {
            expect(valueFormatter.format(1, "0.00 %;-0.00 %;0.00 %")).toBe("100.00 %");
        });

        it("format 100 pct - variation", () => {
            expect(valueFormatter.format(1, "0.0 %;-0.0 %;0.0 %", true)).toBe("100%");
        });

        it("format 52 pct - 4 decimals beautified", () => {
            // we only beautify the default format strings for percent
            expect(valueFormatter.format(0.52, "0.0000 %;-0.0000 %;0.0000 %", true)).toBe("52.0000 %");
        });

        it("format whole pct", () => {
            expect(valueFormatter.format(0.5, "0 %;-0 %;0 %", true)).toBe("50 %");
        });

        it("different signs", () => {
            let format = "Positive;Negative;Zero";
            expect(valueFormatter.format(1, format)).toBe("Positive");
            expect(valueFormatter.format(-1, format)).toBe("Negative");
            expect(valueFormatter.format(0, format)).toBe("Zero");
        });

        it("precision", () => {
            // no decimal places
            let formatter = valueFormatter.create({ format: "$#,0;($#,0);0", value: 0 });
            expect(formatter.format(12345.6789)).toBe("$12,346");
            expect(formatter.format(-12345.6789)).toBe("($12,346)");
            expect(formatter.format(0)).toBe("0");

            // explicit precision in format string
            formatter = valueFormatter.create({ format: "$#,0.000;($#,0.000);0.000", value: 0 });
            expect(formatter.format(12345.6789)).toBe("$12,345.679");
            expect(formatter.format(-12345.6789)).toBe("($12,345.679)");
            expect(formatter.format(0)).toBe("0.000");

            // explicit precision from options
            formatter = valueFormatter.create({ format: "$#,0;($#,0);0", precision: 3, value: 0 });
            expect(formatter.format(12345.6789)).toBe("$12,345.679");
            expect(formatter.format(-12345.6789)).toBe("($12,345.679)");
            expect(formatter.format(0)).toBe("0.000");

            // override format string precision
            formatter = valueFormatter.create({ format: "$#,0.000;($#,0.000);0.000", precision: 2, value: 0 });
            expect(formatter.format(12345.678)).toBe("$12,345.68");
            expect(formatter.format(-12345.678)).toBe("($12,345.68)");
            expect(formatter.format(0)).toBe("0.00");

            // override precision doesn't wipe out trailing literals
            formatter = valueFormatter.create({ format: "#,0 USD", precision: 3, value: 0 });
            expect(formatter.format(12345.6789)).toBe("12,345.679 USD");
        });

        it("special chars in literals", () => {
            // try to confuse formatter with special characters in a literal
            let format = `\\#\\,\\0\\.\\0\\0\\% #,0.00% '#,0.00%'`;
            let value = 987654.32198;
            let expected = "#,0.00% 98,765,432.20% #,0.00%";

            expect(valueFormatter.format(value, format)).toBe(expected);
        });

        it("unterminated literals", () => {
            let format = "#,0.00%";
            let value = 987654.32198;
            let expected = "98,765,432.20%";

            // unterminated single-quote
            expect(valueFormatter.format(value, format + " '" + format)).toBe(expected + " " + format);

            // unterminated double-quote
            expect(valueFormatter.format(value, format + ` "` + format)).toBe(expected + " " + format);

            // backslash at end
            expect(valueFormatter.format(value, format + " \\")).toBe(expected + " ");
        });

        it("format Boolean", () => {
            expect(valueFormatter.format(true)).toBe("True");
            expect(valueFormatter.format(false)).toBe("False");
        });

        it("format Date", () => {
            let date = new Date(2001, 1, 3, 22, 5, 6);
            expect(valueFormatter.format(date, "yyyy\\-MM\\-dd HH:mm:ss")).toBe("2001-02-03 22:05:06");
            expect(valueFormatter.format(date, "yyyy\\-MM\\-dd HH:mm:ss \\t\\t")).toBe("2001-02-03 22:05:06 tt");
            expect(valueFormatter.format(date, "yy\\-MM\\-dd hh:mm tt")).toBe("01-02-03 10:05 PM");
        });

        it("format Invalids", () => {
            expect(valueFormatter.format(Number.NaN)).toBe("NaN");
            expect(valueFormatter.format(Number.NEGATIVE_INFINITY)).toBe("-Infinity");
            expect(valueFormatter.format(Number.POSITIVE_INFINITY)).toBe("+Infinity");
            expect(valueFormatter.format(null)).toBe("(Blank)");
        });
    });

    describe("format strings", () => {

        describe("getFormatString", () => {
            const DefaultDateFormat = valueFormatter.DefaultDateFormat;
            const DefaultIntegerFormat = valueFormatter.DefaultIntegerFormat;
            const DefaultNumericFormat = valueFormatter.DefaultNumericFormat;

            let property: DataViewObjectPropertyIdentifier = { objectName: "fmtObj", propertyName: "fmtProp" };
            let getFormatString = (customFormat: string, columnType: ValueType): string => {
                let column: DataViewMetadataColumn = {
                    displayName: "col",
                };

                if (customFormat)
                    column.objects = {
                        fmtObj: { fmtProp: customFormat }
                    };

                if (columnType)
                    column.type = columnType;

                return valueFormatter.getFormatString(column, property);
            };

            it("column unspecfied format", () => {
                let format = getFormatString(null, null);

                expect(format).toBeUndefined();
            });

            it("column (null)", () => {
                let format = getFormatString(null, ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Null));

                expect(format).toBeUndefined();
            });

            it("column (boolean)", () => {
                let format = getFormatString(null, ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Boolean));

                expect(format).toBeUndefined();
            });

            it("column (date)", () => {
                let format = getFormatString(null, ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Date));

                expect(format).toBe(DefaultDateFormat);
            });

            it("column (datetime)", () => {
                let format = getFormatString(null, ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.DateTime));

                expect(format).toBe(DefaultDateFormat);
            });

            it("column (time)", () => {
                let format = getFormatString(null, ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Time));

                expect(format).toBe(DefaultDateFormat);
            });

            it("column (integer)", () => {
                let format = getFormatString(null, ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Integer));

                expect(format).toBe(DefaultIntegerFormat);
            });

            it("column (double)", () => {
                let format = getFormatString(null, ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double));

                expect(format).toBe(DefaultNumericFormat);
            });

            it("column (decimal)", () => {
                let format = getFormatString(null, ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Decimal));

                expect(format).toBe(DefaultNumericFormat);
            });

            it("column (month)", () => {
                let format = getFormatString(null, ValueType.fromDescriptor({ temporal: { month: true } }));

                expect(format).toBe(DefaultIntegerFormat);
            });

            it("column (year)", () => {
                let format = getFormatString(null, ValueType.fromDescriptor({ temporal: { year: true } }));

                expect(format).toBe("0");
            });

            it("column (text)", () => {
                let format = getFormatString(null, ValueType.fromDescriptor({ text: true }));

                expect(format).toBeUndefined();
            });

            it("column with custom format", () => {
                let customFormat = "*PBI*";
                let format = getFormatString(customFormat, null);

                expect(format).toBe(customFormat);
            });
        });

        describe("formatVariantMeasureValue", () => {
            let columnIntObjFormat: powerbi.DataViewMetadataColumn = { displayName: "col", objects: { fmtObj: { fmtProp: "R" } } };
            let columnIntObjFormatIdentitifer: powerbi.DataViewObjectPropertyIdentifier = { objectName: "fmtObj", propertyName: "fmtProp" };
            let formatter = (value: any, nullsAreBlank: boolean) => valueFormatter.formatVariantMeasureValue(value, columnIntObjFormat, columnIntObjFormatIdentitifer, nullsAreBlank);

            it("format null", () => {
                expect(formatter(null, false)).toBe("");
                expect(formatter(null, true)).toBe("(Blank)");
            });

            it("format empty", () => {
                expect(formatter("", false)).toBe("");
                expect(formatter("", true)).toBe("");
            });

            it("format non-null value", () => {
                expect(formatter(2010, false)).not.toBeNull();
                expect(formatter(2010, true)).not.toBeNull();
            });

            it("format datetime value", () => {
                expect(formatter(new Date(599914800000), false)).toBe("1/4/1989");
                expect(formatter(new Date(599914800000), true)).toBe("1/4/1989");
            });
        });
    });

    describe("create", () => {
        it("create basic format with invalid values", () => {
            let scale = valueFormatter.create({ format: "0", value: 0 });

            expect(scale.format(Number.NaN)).toBe("NaN");
            expect(scale.format(Number.NEGATIVE_INFINITY)).toBe("-Infinity");
            expect(scale.format(Number.POSITIVE_INFINITY)).toBe("+Infinity");
            expect(scale.format(null)).toBe("(Blank)");
        });

        it("create non-null/null init", () => {
            let scale = valueFormatter.create({ format: "0", value: 1e6, value2: null });

            expect(scale.format(-2.4e6)).toBe("-2.4M");
        });

        it("create null/non-null init", () => {
            let scale = valueFormatter.create({ format: "0", value: null, value2: 1e6 });

            expect(scale.format(-2.4e6)).toBe("-2.4M");
        });

        it("create abs value init", () => {
            let scale = valueFormatter.create({ format: "0", value: -3e6, value2: 2 });

            expect(scale.format(-3e6)).toBe("-3M");
        });

        it("create Year", () => {
            let scale = valueFormatter.create({ format: "d", value: new Date(2010, 1) });

            expect(scale.format(2010)).toBe("2010");
            expect(scale.format(null)).toBe("(Blank)");
        });

        it("create No Scale", () => {
            let scale = valueFormatter.create({ value: 0 });

            expect(scale.format(0)).toBe("0");
            expect(scale.format(0.5678934)).toBe("0.5678934");
            expect(scale.format(-0.5678934)).toBe("-0.5678934");
            expect(scale.format(1.234e7)).toBe("12340000");
            expect(scale.format(1.12000000000000000000007)).toBe("1.12");
        });

        it("create Million", () => {
            let scale = valueFormatter.create({ value: 1e6 });

            expect(scale.format(4.56e7)).toBe("45.6M");
            expect(scale.format(4.56789123e7)).toBe("45.68M");
            expect(scale.format(-3130000.567)).toBe("-3.13M");
            expect(scale.format(10000)).toBe("0.01M");
            expect(scale.format(100000)).toBe("0.1M");
            expect(scale.format(null)).toBe("(Blank)");
        });

        it("create Billion", () => {
            let scale = valueFormatter.create({ value: 1e9 });

            expect(scale.format(4.56e10)).toBe("45.6bn");
            expect(scale.format(4.56789123e10)).toBe("45.68bn");
            expect(scale.format(-3130000000.567)).toBe("-3.13bn");
            expect(scale.format(100000000)).toBe("0.1bn");
            expect(scale.format(1000000000)).toBe("1bn");
            expect(scale.format(null)).toBe("(Blank)");
        });

        it("create Trillion", () => {
            let scale = valueFormatter.create({ value: 1e12 });

            expect(scale.format(4.56e13)).toBe("45.6T");
            expect(scale.format(4.56789123e13)).toBe("45.68T");
            expect(scale.format(-3130000000000.567)).toBe("-3.13T");
            expect(scale.format(100000000000)).toBe("0.1T");
            expect(scale.format(1000000000000)).toBe("1T");
            expect(scale.format(100000000000000)).toBe("100T");
            expect(scale.format(1000000000000000)).toBe("1000T");
            expect(scale.format(1000000000000001)).toBe("1E+15");
            expect(scale.format(1000000000000000000)).toBe("1E+18");
            expect(scale.format(null)).toBe("(Blank)");
        });

        it("create Trillion ($)", () => {
            let scale = valueFormatter.create({ value: 1e12, format: "$#,0.00" });

            expect(scale.format(4.56e13)).toBe("$45.60T");
            expect(scale.format(4.56789123e13)).toBe("$45.68T");
            expect(scale.format(-3130000000000.567)).toBe("-$3.13T");
            expect(scale.format(100000000000)).toBe("$0.10T");
            expect(scale.format(1000000000000)).toBe("$1.00T");
            expect(scale.format(100000000000000)).toBe("$100.00T");
            expect(scale.format(1000000000000000)).toBe("$1,000.00T");
            expect(scale.format(1000000000000001)).toBe("$1,000.00T");
            expect(scale.format(1000000000000000000)).toBe("$1,000,000.00T");
            expect(scale.format(null)).toBe("(Blank)");
        });

        it("create Trillion ($ and precision(1))", () => {
            let scale = valueFormatter.create({ value: 1e12, format: "$#,0.00", precision: 1 });

            expect(scale.format(4.56e13)).toBe("$45.6T");
            expect(scale.format(4.56789123e13)).toBe("$45.7T");
            expect(scale.format(-3130000000000.567)).toBe("-$3.1T");
            expect(scale.format(160000000000)).toBe("$0.2T");
            expect(scale.format(1600000000000)).toBe("$1.6T");
            expect(scale.format(160000000000000)).toBe("$160.0T");
            expect(scale.format(1600000000000000)).toBe("$1,600.0T");
            expect(scale.format(1600000000000000000)).toBe("$1,600,000.0T");
            expect(scale.format(null)).toBe("(Blank)");
        });

        it("create Exponent format", () => {
            let scale = valueFormatter.create({ format: "E", value: 1e15 });

            expect(scale.format(719200000000001920000000000)).toBe("7.192000E+026");
        });

        it("create Exponent format", () => {
            let scale = valueFormatter.create({ value: 1e15 });

            expect(scale.format(719200000000001920000000000)).toBe("7.19E+26");
        });

        it("create Exponent format with precision(1)", () => {
            let scale = valueFormatter.create({ value: 1e15, precision: 1 });

            expect(scale.format(719200000000001920000000000)).toBe("7.2E+26");
        });

        it("create Percentage", () => {
            let scale = valueFormatter.create({ format: "0.00 %;-0.00 %;0.00 %", value: 1, allowFormatBeautification: true });

            // beautified -> #,0.##%
            expect(scale.format(0)).toBe("0%");
            expect(scale.format(1)).toBe("100%");
            expect(scale.format(-1)).toBe("-100%");
            expect(scale.format(.54)).toBe("54%");
            expect(scale.format(.543)).toBe("54.3%");
            expect(scale.format(.5432)).toBe("54.32%");
            expect(scale.format(.54321)).toBe("54.32%");
            expect(scale.format(6.54321)).toBe("654.32%");
            expect(scale.format(76.54321)).toBe("7,654.32%");
        });

        it("create Escaped Character format", () => {
            let scale = valueFormatter.create({ format: "\\$#,0.00;(\\$#,0.00);\\$#,0.00", value: 1e6 });

            expect(scale.format(107384391.61)).toBe("$107.38M");
            expect(scale.format(-107384391.61)).toBe("($107.38M)");
        });

        it("create Format no custom negative", () => {
            let scale = valueFormatter.create({ format: "$#,0.00", value: 1e6 });

            expect(scale.format(-107384391.61)).toBe("-$107.38M");
        });

        it("create HundredThousand", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 300000 });

            expect(scale.format(300000)).toBe("0.3M");
        });

        it("create Million", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 900000000 });

            expect(scale.format(900000000)).toBe("0.9bn");
        });

        it("create Billion", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 900000000000 });

            expect(scale.format(900000000000)).toBe("0.9T");
        });

        it("create Trillion", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 9e14, displayUnitSystemType: DisplayUnitSystemType.Default });

            expect(scale.format(9e14)).toBe("900T");
        });

        it("create Exponent", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 9e15, displayUnitSystemType: DisplayUnitSystemType.Default });

            expect(scale.format(9e15)).toBe("9E+15");
        });

        it("create HundredThousand Whole Units", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 300000, displayUnitSystemType: DisplayUnitSystemType.WholeUnits });

            expect(scale.format(300000)).toBe("300K");
        });

        it("create Million Whole Units", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 900000000, displayUnitSystemType: DisplayUnitSystemType.WholeUnits });

            expect(scale.format(900000000)).toBe("900M");
        });

        it("create Billion Whole Units", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 900000000000, displayUnitSystemType: DisplayUnitSystemType.WholeUnits });

            expect(scale.format(900000000000)).toBe("900bn");
        });

        it("create Trillion Whole Units", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 900000000000000, displayUnitSystemType: DisplayUnitSystemType.WholeUnits });

            expect(scale.format(900000000000000)).toBe("900T");
        });

        it("create HundredThousand Verbose (No Units)", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 300000, displayUnitSystemType: DisplayUnitSystemType.Verbose });

            expect(scale.format(300000)).toBe("300000");
        });

        it("create Million Verbose (No Units)", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 900000000, displayUnitSystemType: DisplayUnitSystemType.Verbose });

            expect(scale.format(900000000)).toBe("900000000");
        });

        it("create Billion Verbose (No Units)", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 900000000000, displayUnitSystemType: DisplayUnitSystemType.Verbose });

            expect(scale.format(900000000000)).toBe("900000000000");
        });

        it("create Trillion Verbose (No Units)", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 900000000000000, displayUnitSystemType: DisplayUnitSystemType.Verbose });

            expect(scale.format(900000000000000)).toBe("900000000000000");
        });

        it("create single value formatting verbose", () => {
            let format: string = "#,0.00";
            let scale = valueFormatter.create({ format: format, value: 26.254, displayUnitSystemType: DisplayUnitSystemType.Verbose, formatSingleValues: true });

            // Default formatting for numeric types is 2dp
            expect(scale.format(26.254)).toBe("26.25");
        });

        it("create single value formatting verbose large", () => {
            let format: string = "#,0.00";
            let scale = valueFormatter.create({ format: format, value: 300000.254, displayUnitSystemType: DisplayUnitSystemType.Verbose, formatSingleValues: true });

            // Verbose formatting shouldn't use units
            expect(scale.format(300000.254)).toBe("300,000.25");
        });

        it("precision without display units", () => {
            let scale = valueFormatter.create({ value: 0, precision: 3 });

            expect(scale.format(12.1012)).toBe("12.101");
        });

        it("precision with display units", () => {
            let format: string = "#,0.00";
            let scale = valueFormatter.create({ format: format, value: 10000, precision: 2 });

            expect(scale.format(12177)).toBe("12.18K");
        });

        it("precision 1 with display units", () => {
            let format: string = "#,0.00";
            let scale = valueFormatter.create({ format: format, value: 10000, precision: 1 });

            expect(scale.format(12177)).toBe("12.2K");
        });

        it("precision with display units and no format string", () => {
            let scale = valueFormatter.create({ value: 10000, precision: 2 });
            expect(scale.format(12177)).toBe("12.18K");
        });

        it("Verify single value integer formatting for values less than 10K should not show display units", () => {
            let format: string = "g";
            let input: number = 9999;
            let columnType = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Integer);
            let scale = valueFormatter.create({ format: format, value: input, formatSingleValues: true, columnType: columnType });

            expect(scale.format(input)).toBe("9999");
        });

        it("Verify single value integer formatting for numeric values less than 10K should show display units", () => {
            // NOTE: In this case the column type is Integer, but the value is actually numeric.
            let format: string = "g";
            let input: number = 9999.12345;
            let columnType = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Integer);
            let scale = valueFormatter.create({ format: format, value: input, formatSingleValues: true, columnType: columnType });

            // When using 'g' with display units we fall back to the the default format string for numeric.
            expect(scale.format(input)).toBe("10.00K");
        });

        it("Verify single value number formatting with display units for values greater than 10K should show display units", () => {
            let format: string = "g";
            let input: number = 10001;
            let columnType = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double);
            let scale = valueFormatter.create({ format: format, value: input, formatSingleValues: true, columnType: columnType });

            expect(scale.format(input)).toBe("10.00K");
        });

        it("Verify single value custom formatting with single decimal value should not show display units", () => {
            let format: string = "0";
            let input: number = 1999.2;
            let columnType = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double);
            let scale = valueFormatter.create({ format: format, value: input, formatSingleValues: true, columnType: columnType });

            expect(scale.format(input)).toBe("1999");
        });

        it("Verify single value custom formatting with two decimal values should show display units", () => {
            let format: string = "0.00";
            let input: number = 1999.9;
            let columnType = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double);
            let scale = valueFormatter.create({ format: format, value: input, formatSingleValues: true, columnType: columnType });

            expect(scale.format(input)).toBe("2.00K");
        });

        it("Verify single value number formatting for values less than 10K should show display units", () => {
            let format: string = "g";
            let input: number = 1999.9;
            let columnType = ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double);
            let scale = valueFormatter.create({ format: format, value: input, formatSingleValues: true, columnType: columnType });

            // When using 'g' with display units we fall back to the the default format string for numeric.
            expect(scale.format(input)).toBe("2.00K");
        });

        it("create Boolean", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: false, value2: true, tickCount: 6 });

            expect(scale.format(true)).toBe("True");
            expect(scale.format(false)).toBe("False");
            expect(scale.format(null)).toBe("(Blank)");
        });

        it("create Boolean with numeric index values", () => {
            let format: string;
            let scale = valueFormatter.create({ format: format, value: 0, value2: 1, tickCount: 6 });

            expect(scale.format(true)).toBe("True");
            expect(scale.format(false)).toBe("False");
            expect(scale.format(null)).toBe("(Blank)");
        });

        it("create Date", () => {
            let format: string = "O";
            let minDate = new Date(2014, 10, 4, 12, 34, 56, 789);
            let maxDate = new Date(2014, 10, 9, 12, 34, 56, 789);
            let scale = valueFormatter.create({ format: format, value: minDate, value2: maxDate, tickCount: 6 });

            expect(scale.format(minDate)).toBe("Nov 04");
            expect(scale.format(maxDate)).toBe("Nov 09");
            expect(scale.format(null)).toBe("(Blank)");
        });
    });

    describe("formatListAnd", () => {
        it("formatListAnd no values", () => {
            expect(valueFormatter.formatListAnd([])).toBeNull();
        });

        it("formatListAnd 1 value", () => {
            expect(valueFormatter.formatListAnd(["1"])).toBe("1");
        });

        it("formatListAnd 2 values", () => {
            expect(valueFormatter.formatListAnd(["1", "2"])).toBe("1 and 2");
        });

        it("formatListAnd 3 values", () => {
            expect(valueFormatter.formatListAnd(["1", "2", "3"])).toBe("1, 2 and 3");
        });

        it("formatListAnd wrong parameters values", () => {
            expect(valueFormatter.formatListAnd(null)).toBeNull();
            expect(valueFormatter.formatListAnd(undefined)).toBeNull();
        });
    });

    describe("formatListOr", () => {
        it("formatListOr no values", () => {
            expect(valueFormatter.formatListOr([])).toBeNull();
        });

        it("formatListOr 1 value", () => {
            expect(valueFormatter.formatListOr(["1"])).toBe("1");
        });

        it("formatListOr wrong parameters values", () => {
            expect(valueFormatter.formatListOr(null)).toBeNull();
            expect(valueFormatter.formatListOr(undefined)).toBeNull();
        });
    });

    it("getDisplayUnits", () => {
        let displayUnits = valueFormatter.getDisplayUnits(DisplayUnitSystemType.Default);
        expect(displayUnits).toBeDefined();
        expect(displayUnits.length).toBeGreaterThan(0);
    });
});
