export default class NumberFormatter {
    static numberFormat: {
        pattern: ["-n"];
        decimals: 2;
        ",": ",";
        ".": ".";
        groupSizes: [3];
        "+": "+";
        "-": "-";
        percent: {
            pattern: ["-n %", "n %"];
            decimals: 2;
            groupSizes: [3];
            ",": ",";
            ".": ".";
            symbl: "%";
        };
        currency: {
            pattern: ["($n)", "$n"];
            decimals: 2;
            groupSizes: [3];
            ",": ",";
            ".": ".";
            symbl: "$";
        };
    };
    static expandNumber(number_: any, precision: any, formatInfo: any): string;
    static zeroPad(str: any, count: any, left?: any): any;
    static formatNumber(value: any, format: any, culture: any): any;
}
