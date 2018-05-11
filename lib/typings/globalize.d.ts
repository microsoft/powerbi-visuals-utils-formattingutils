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
