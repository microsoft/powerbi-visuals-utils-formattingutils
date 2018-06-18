export default class DateFormatter {
    static token: RegExp;
    static timezone: RegExp;
    static timezoneClip: RegExp;
    static pad(val: any, len?: any): any;
    static masks: {
        "default": string;
        shortDate: string;
        mediumDate: string;
        longDate: string;
        fullDate: string;
        shortTime: string;
        mediumTime: string;
        longTime: string;
        isoDate: string;
        isoTime: string;
        isoDateTime: string;
        isoUtcDateTime: string;
    };
    static i18n: {
        dayNames: string[];
        monthNames: string[];
    };
    static format(date: any, mask: any, utc: any): any;
}
