export default class DateFormatter {
    static token = /d{1,4}|m{1,4}|M{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;
    static timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
    static timezoneClip = /[^-+\dA-Z]/g;
    static pad(val, len?) {
        val = String(val);
        len = len || 2;
        while (val.length < len) val = "0" + val;
        return val;
    }

    // Some common format strings
    static masks = {
        "default":      "ddd mmm dd yyyy HH:MM:ss",
        shortDate:      "m/d/yy",
        mediumDate:     "mmm d, yyyy",
        longDate:       "mmmm d, yyyy",
        fullDate:       "dddd, mmmm d, yyyy",
        shortTime:      "h:MM TT",
        mediumTime:     "h:MM:ss TT",
        longTime:       "h:MM:ss TT Z",
        isoDate:        "yyyy-mm-dd",
        isoTime:        "HH:MM:ss",
        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    // Internationalization strings
    static i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };

    // Regexes and supporting functions are cached through closure
    static format(date, mask, utc) {
        let dF = DateFormatter;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length === 1 && Object.prototype.toString.call(date) === "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(DateFormatter.masks[mask] || mask || DateFormatter.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) === "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        let	_ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            M = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            m = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   DateFormatter.pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m,
                mm:   DateFormatter.pad(m),
                mmm:  dF.i18n.monthNames[M],
                mmmm: dF.i18n.monthNames[M + 12],
                MMMM: dF.i18n.monthNames[M + 12],
                MMM:  dF.i18n.monthNames[M],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   DateFormatter.pad(H % 12 || 12),
                H:    H,
                HH:   DateFormatter.pad(H),
                M:    M + 1,
                MM:   DateFormatter.pad(M + 1),
                s:    s,
                ss:   DateFormatter.pad(s),
                l:    DateFormatter.pad(L, 3),
                L:    DateFormatter.pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "AM" : "PM",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(DateFormatter.timezone) || [""]).pop().replace(DateFormatter.timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + DateFormatter.pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : <any>(d % 100 - d % 10 !== 10) * d % 10]
            };

        return mask.replace(DateFormatter.token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    }
}
