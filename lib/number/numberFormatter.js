export default class NumberFormatter {
    static expandNumber(number_, precision, formatInfo) {
        let groupSizes = formatInfo.groupSizes, curSize = groupSizes[0], curGroupIndex = 1, factor = Math.pow(10, precision), rounded = Math.round(number_ * factor) / factor;
        if (!isFinite(rounded)) {
            rounded = number_;
        }
        number_ = rounded;
        let numberString = number_ + "", right = "", split = numberString.split(/e/i), exponent = split.length > 1 ? parseInt(split[1], 10) : 0;
        numberString = split[0];
        split = numberString.split(".");
        numberString = split[0];
        right = split.length > 1 ? split[1] : "";
        let l;
        if (exponent > 0) {
            right = NumberFormatter.zeroPad(right, exponent, false);
            numberString += right.slice(0, exponent);
            right = right.substr(exponent);
        }
        else if (exponent < 0) {
            exponent = -exponent;
            numberString = NumberFormatter.zeroPad(numberString, exponent + 1);
            right = numberString.slice(-exponent, numberString.length) + right;
            numberString = numberString.slice(0, -exponent);
        }
        if (precision > 0) {
            right = formatInfo["."] +
                ((right.length > precision) ? right.slice(0, precision) : NumberFormatter.zeroPad(right, precision));
        }
        else {
            right = "";
        }
        let stringIndex = numberString.length - 1, sep = formatInfo[","], ret = "";
        while (stringIndex >= 0) {
            if (curSize === 0 || curSize > stringIndex) {
                return numberString.slice(0, stringIndex + 1) + (ret.length ? (sep + ret + right) : right);
            }
            ret = numberString.slice(stringIndex - curSize + 1, stringIndex + 1) + (ret.length ? (sep + ret) : "");
            stringIndex -= curSize;
            if (curGroupIndex < groupSizes.length) {
                curSize = groupSizes[curGroupIndex];
                curGroupIndex++;
            }
        }
        return numberString.slice(0, stringIndex + 1) + sep + ret + right;
    }
    static zeroPad(str, count, left) {
        let l;
        for (l = str.length; l < count; l += 1) {
            str = (left ? ("0" + str) : (str + "0"));
        }
        return str;
    }
    static formatNumber(value, format, culture) {
        if (!format || format === "i") {
            return culture.name.length ? value.toLocaleString() : value.toString();
        }
        format = format || "D";
        let nf = NumberFormatter.numberFormat, number_ = Math.abs(value), precision = -1, pattern;
        if (format.length > 1)
            precision = parseInt(format.slice(1), 10);
        let current = format.charAt(0).toUpperCase(), formatInfo;
        switch (current) {
            case "D":
                pattern = "n";
                if (precision !== -1) {
                    number_ = NumberFormatter.zeroPad("" + number_, precision, true);
                }
                if (value < 0)
                    number_ = -number_;
                break;
            case "N":
                formatInfo = nf;
            // fall through
            case "C":
                formatInfo = formatInfo || nf.currency;
            // fall through
            case "P":
                formatInfo = formatInfo || nf.percent;
                pattern = value < 0 ? formatInfo.pattern[0] : (formatInfo.pattern[1] || "n");
                if (precision === -1)
                    precision = formatInfo.decimals;
                number_ = NumberFormatter.expandNumber(number_ * (current === "P" ? 100 : 1), precision, formatInfo);
                break;
            default:
                throw "Bad number format specifier: " + current;
        }
        let patternParts = /n|\$|-|%/g, ret = "";
        for (;;) {
            let index = patternParts.lastIndex, ar = patternParts.exec(pattern);
            ret += pattern.slice(index, ar ? ar.index : pattern.length);
            if (!ar) {
                break;
            }
            switch (ar[0]) {
                case "n":
                    ret += number_;
                    break;
                case "$":
                    ret += nf.currency.symbl;
                    break;
                case "-":
                    // don't make 0 negative
                    if (/[1-9]/.test(number_.toString())) {
                        ret += nf["-"];
                    }
                    break;
                case "%":
                    ret += nf.percent.symbl;
                    break;
            }
        }
        return ret;
    }
}
//# sourceMappingURL=numberFormatter.js.map