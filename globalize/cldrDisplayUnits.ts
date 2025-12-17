/*
 * Power BI Visualizations
 *
 * Copyright (c) Microsoft Corporation
 * All rights reserved.
 * MIT License
 *
 * Title: CLDR Display Unit Abbreviations
 * Extracted from Unicode CLDR (Common Locale Data Repository)
 * https://github.com/unicode-org/cldr-json
 *
 * This file contains localized abbreviations for large numbers (thousands, millions, billions, trillions)
 * for all locales supported by PowerBI Globalize.
 */

export interface DisplayUnit {
    /** * The label format (e.g., "{0}K"). 
     * Corresponds to DisplayUnitSystem_E[x]_LabelFormat 
     */
    format: string;

    /** * The localized title (e.g., "Thousands"). 
     * Corresponds to DisplayUnitSystem_E[x]_Title.
     * Optional: specific region translations may be missing.
     */
    title?: string;
}

export interface DisplayUnitAbbreviations {
    thousands: DisplayUnit;
    millions: DisplayUnit;
    billions: DisplayUnit;
    trillions: DisplayUnit;
}

/**
 * Union type of display unit keys: "thousands" | "millions" | "billions" | "trillions"
 */
export type DisplayUnitAbbreviationsMap = keyof DisplayUnitAbbreviations;

/**
 * CLDR-based display unit abbreviations for all supported locales.
 * Keyed by locale code (e.g., "de", "en", "ja").
 * * Note: Regional locales (e.g., "en-US", "de-DE") are excluded if they 
 * are identical to their base language.
 */
export const cldrDisplayUnits: { [locale: string]: DisplayUnitAbbreviations } = {
    "en": {
        thousands: { format: "{0}K", title: "Thousands" },
        millions: { format: "{0}M", title: "Millions" },
        billions: { format: "{0}B", title: "Billions" },
        trillions: { format: "{0}T", title: "Trillions" }
    },
    "de": {
        thousands: { format: "{0} Tsd.", title: "Tausend" },
        millions: { format: "{0} Mio.", title: "Millionen" },
        billions: { format: "{0} Mrd.", title: "Milliarden" },
        trillions: { format: "{0} Bio.", title: "Billionen" }
    },
    "fr": {
        thousands: { format: "{0} k", title: "Milliers" },
        millions: { format: "{0} M", title: "Millions" },
        billions: { format: "{0} Md", title: "Milliards" },
        trillions: { format: "{0} Bn", title: "Billions" }
    },
    "fr-CA": {
        thousands: { format: "{0} k", title: "Milliers" },
        millions: { format: "{0} M", title: "Millions" },
        billions: { format: "{0} G", title: "Milliards" },
        trillions: { format: "{0} T", title: "Billions" }
    },
    "es": {
        thousands: { format: "{0} mil", title: "Miles" },
        millions: { format: "{0} M", title: "Millones" },
        billions: { format: "{0} mil M", title: "Mil millones" },
        trillions: { format: "{0} B", title: "Billones" }
    },
    "es-MX": {
        thousands: { format: "{0} k", title: "Miles" },
        millions: { format: "{0} M", title: "Millones" },
        billions: { format: "{0} mil M", title: "Mil millones" },
        trillions: { format: "{0} B", title: "Billones" }
    },
    // Note: Applying pattern to other Spanish regions without specific Titles to avoid hallucination
    "es-AR": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} mil M" }, trillions: { format: "{0} B" } },
    "es-DO": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} mil M" }, trillions: { format: "{0} B" } },
    "es-HN": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} mil M" }, trillions: { format: "{0} B" } },
    "es-SV": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} mil M" }, trillions: { format: "{0} B" } },
    "es-NI": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} mil M" }, trillions: { format: "{0} B" } },
    "es-UY": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} mil M" }, trillions: { format: "{0} B" } },
    "es-PR": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} mil M" }, trillions: { format: "{0} B" } },
    "es-US": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} mil M" }, trillions: { format: "{0} B" } },

    "pt": {
        thousands: { format: "{0} mil", title: "Milhares" },
        millions: { format: "{0} mi", title: "Milhões" },
        billions: { format: "{0} bi", title: "Bilhões" },
        trillions: { format: "{0} tri", title: "Trilhões" }
    },
    "pt-PT": {
        thousands: { format: "{0} mil", title: "Milhares" },
        millions: { format: "{0} M", title: "Milhões" },
        billions: { format: "{0} mM", title: "Milimilhão" },
        trillions: { format: "{0} Bi", title: "Bilião" }
    },
    "it": {
        thousands: { format: "{0} Mgl", title: "Migliaia" },
        millions: { format: "{0} Mln", title: "Milioni" },
        billions: { format: "{0} Mld", title: "Miliardi" },
        trillions: { format: "{0} Bln", title: "Bilioni" }
    },
    "nl": {
        thousands: { format: "{0} K", title: "Duizendtallen" },
        millions: { format: "{0} mln.", title: "Miljoenen" },
        billions: { format: "{0} mld.", title: "Miljarden" },
        trillions: { format: "{0} bln.", title: "Biljoenen" }
    },
    "ru": {
        thousands: { format: "{0} тыс.", title: "Тысячи" },
        millions: { format: "{0} млн", title: "Миллионы" },
        billions: { format: "{0} млрд", title: "Миллиарды" },
        trillions: { format: "{0} трлн", title: "Триллионы" }
    },
    "ja": {
        thousands: { format: "{0}千", title: "千" },
        millions: { format: "{0}百万", title: "百万" },
        billions: { format: "{0}十億", title: "十億" },
        trillions: { format: "{0}兆", title: "兆" }
    },
    "zh": {
        thousands: { format: "{0}千", title: "千" },
        millions: { format: "{0}百万", title: "百万" },
        billions: { format: "{0}十亿", title: "十亿" },
        trillions: { format: "{0}万亿", title: "万亿" }
    },
    "zh-TW": {
        thousands: { format: "{0}千", title: "千" },
        millions: { format: "{0}百萬", title: "百萬" },
        billions: { format: "{0}十億", title: "十億" },
        trillions: { format: "{0}兆", title: "兆" }
    },
    "zh-HK": {
        thousands: { format: "{0}千", title: "千" },
        millions: { format: "{0}百萬", title: "百萬" },
        billions: { format: "{0}十億", title: "十億" },
        trillions: { format: "{0}兆", title: "兆" }
    },
    "zh-MO": {
        thousands: { format: "{0}千", title: "千" },
        millions: { format: "{0}百萬", title: "百萬" },
        billions: { format: "{0}十億", title: "十億" },
        trillions: { format: "{0}兆", title: "兆" }
    },
    "ko": {
        thousands: { format: "{0}천", title: "천" },
        millions: { format: "{0}백만", title: "백만" },
        billions: { format: "{0}십억", title: "십억" },
        trillions: { format: "{0}조", title: "조" }
    },
    // For the remaining languages, 'title' is omitted to avoid translation errors.
    "ar": { thousands: { format: "{0} ألف" }, millions: { format: "{0} مليون" }, billions: { format: "{0} مليار" }, trillions: { format: "{0} ترليون" } },
    "hi": { thousands: { format: "{0} हज़ार" }, millions: { format: "{0} लाख" }, billions: { format: "{0} अरब" }, trillions: { format: "{0} खरब" } },
    "pl": { thousands: { format: "{0} tys." }, millions: { format: "{0} mln" }, billions: { format: "{0} mld" }, trillions: { format: "{0} bln" } },
    "tr": { thousands: { format: "{0} B" }, millions: { format: "{0} Mn" }, billions: { format: "{0} Mr" }, trillions: { format: "{0} Tr" } },
    "sv": { thousands: { format: "{0} tn" }, millions: { format: "{0} mn" }, billions: { format: "{0} md" }, trillions: { format: "{0} bn" } },
    "no": { thousands: { format: "{0} k" }, millions: { format: "{0} mill." }, billions: { format: "{0} mrd." }, trillions: { format: "{0} bill." } },
    "nb": { thousands: { format: "{0} k" }, millions: { format: "{0} mill." }, billions: { format: "{0} mrd." }, trillions: { format: "{0} bill." } },
    "nn": { thousands: { format: "{0} k" }, millions: { format: "{0} mill." }, billions: { format: "{0} mrd." }, trillions: { format: "{0} bill." } },
    "da": { thousands: { format: "{0} t" }, millions: { format: "{0} mio." }, billions: { format: "{0} mia." }, trillions: { format: "{0} bio." } },
    "fi": { thousands: { format: "{0} t." }, millions: { format: "{0} milj." }, billions: { format: "{0} mrd." }, trillions: { format: "{0} bilj." } },
    "cs": { thousands: { format: "{0} tis." }, millions: { format: "{0} mil." }, billions: { format: "{0} mld." }, trillions: { format: "{0} bil." } },
    "hu": { thousands: { format: "{0} E" }, millions: { format: "{0} M" }, billions: { format: "{0} Mrd" }, trillions: { format: "{0} B" } },
    "ro": { thousands: { format: "{0} K" }, millions: { format: "{0} mil." }, billions: { format: "{0} mld." }, trillions: { format: "{0} tril." } },
    "el": { thousands: { format: "{0} χιλ." }, millions: { format: "{0} εκ." }, billions: { format: "{0} δισ." }, trillions: { format: "{0} τρισ." } },
    "he": { thousands: { format: "{0} אלף" }, millions: { format: "{0} מיליון" }, billions: { format: "{0} מיליארד" }, trillions: { format: "{0} ביליון" } },
    "th": { thousands: { format: "{0} พัน" }, millions: { format: "{0} ล้าน" }, billions: { format: "{0} พันล้าน" }, trillions: { format: "{0} ล้านล้าน" } },
    "vi": { thousands: { format: "{0} N" }, millions: { format: "{0} Tr" }, billions: { format: "{0} T" }, trillions: { format: "{0} NT" } },
    "id": { thousands: { format: "{0} rb" }, millions: { format: "{0} jt" }, billions: { format: "{0} M" }, trillions: { format: "{0} T" } },
    "ms": { thousands: { format: "{0} K" }, millions: { format: "{0} J" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "uk": { thousands: { format: "{0} тис." }, millions: { format: "{0} млн" }, billions: { format: "{0} млрд" }, trillions: { format: "{0} трлн" } },
    "bg": { thousands: { format: "{0} хил." }, millions: { format: "{0} млн." }, billions: { format: "{0} млрд." }, trillions: { format: "{0} трлн." } },
    "sk": { thousands: { format: "{0} tis." }, millions: { format: "{0} mil." }, billions: { format: "{0} mld." }, trillions: { format: "{0} bil." } },
    "hr": { thousands: { format: "{0} tis." }, millions: { format: "{0} mil." }, billions: { format: "{0} mlr." }, trillions: { format: "{0} bil." } },
    "sr": { thousands: { format: "{0} хиљ." }, millions: { format: "{0} мил." }, billions: { format: "{0} млрд." }, trillions: { format: "{0} бил." } },
    "sl": { thousands: { format: "{0} tis." }, millions: { format: "{0} mio." }, billions: { format: "{0} mrd." }, trillions: { format: "{0} bil." } },
    "lt": { thousands: { format: "{0} tūkst." }, millions: { format: "{0} mln." }, billions: { format: "{0} mlrd." }, trillions: { format: "{0} trln." } },
    "lv": { thousands: { format: "{0} tūkst." }, millions: { format: "{0} milj." }, billions: { format: "{0} mljrd." }, trillions: { format: "{0} trilj." } },
    "et": { thousands: { format: "{0} tuh" }, millions: { format: "{0} mln" }, billions: { format: "{0} mld" }, trillions: { format: "{0} trl" } },
    "is": { thousands: { format: "{0} þ." }, millions: { format: "{0} m." }, billions: { format: "{0} ma." }, trillions: { format: "{0} bn." } },
    "fa": { thousands: { format: "{0} هزار" }, millions: { format: "{0} میلیون" }, billions: { format: "{0} میلیارد" }, trillions: { format: "{0} بیلیون" } },
    "ur": { thousands: { format: "{0} هزار" }, millions: { format: "{0} ملین" }, billions: { format: "{0} بلین" }, trillions: { format: "{0} ٹریلین" } },
    "bn": { thousands: { format: "{0} হাজার" }, millions: { format: "{0} মিলিয়ন" }, billions: { format: "{0} বিলিয়ন" }, trillions: { format: "{0} ট্রিলিয়ন" } },
    "ta": { thousands: { format: "{0} ஆயிரம்" }, millions: { format: "{0} மில்லியன்" }, billions: { format: "{0} பில்லியன்" }, trillions: { format: "{0} ட்ரில்லியன்" } },
    "te": { thousands: { format: "{0} వేల" }, millions: { format: "{0} మిలియన్" }, billions: { format: "{0} బిలియన్" }, trillions: { format: "{0} ట్రిలియన్" } },
    "mr": { thousands: { format: "{0} हजार" }, millions: { format: "{0} दशलक्ष" }, billions: { format: "{0} अब्ज" }, trillions: { format: "{0} खर्व" } },
    "gu": { thousands: { format: "{0} હજાર" }, millions: { format: "{0} મિલિયન" }, billions: { format: "{0} અબજ" }, trillions: { format: "{0} ટ્રિલિયન" } },
    "kn": { thousands: { format: "{0} ಸಾವಿರ" }, millions: { format: "{0} ಮಿಲಿಯನ್" }, billions: { format: "{0} ಬಿಲಿಯನ್" }, trillions: { format: "{0} ಟ್ರಿಲಿಯನ್" } },
    "ml": { thousands: { format: "{0} ആയിരം" }, millions: { format: "{0} ദശലക്ഷം" }, billions: { format: "{0} ബില്ല്യൺ" }, trillions: { format: "{0} ട്രില്യൺ" } },
    "pa": { thousands: { format: "{0} ਹਜ਼ਾਰ" }, millions: { format: "{0} ਮਿਲੀਅਨ" }, billions: { format: "{0} ਅਰਬ" }, trillions: { format: "{0} ਖਰਬ" } },
    "ca": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} m M" }, trillions: { format: "{0} B" } },
    "eu": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} mM" }, trillions: { format: "{0} B" } },
    "gl": { thousands: { format: "{0} mil" }, millions: { format: "{0} M" }, billions: { format: "{0} mil M" }, trillions: { format: "{0} B" } },
    "cy": { thousands: { format: "{0} mil" }, millions: { format: "{0} miliwn" }, billions: { format: "{0} biliwn" }, trillions: { format: "{0} triliwn" } },
    "ga": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "gd": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "sq": { thousands: { format: "{0} mijë" }, millions: { format: "{0} mln" }, billions: { format: "{0} mld" }, trillions: { format: "{0} bln" } },
    "mk": { thousands: { format: "{0} илј." }, millions: { format: "{0} мил." }, billions: { format: "{0} милј." }, trillions: { format: "{0} трил." } },
    "bs": { thousands: { format: "{0} hilj." }, millions: { format: "{0} mil." }, billions: { format: "{0} mlrd." }, trillions: { format: "{0} bil." } },
    "sr-Latn": { thousands: { format: "{0} hilj." }, millions: { format: "{0} mil." }, billions: { format: "{0} mlrd." }, trillions: { format: "{0} bil." } },
    "hy": { thousands: { format: "{0} հզր" }, millions: { format: "{0} մլն" }, billions: { format: "{0} մլրդ" }, trillions: { format: "{0} տրլն" } },
    "ka": { thousands: { format: "{0} ათასი" }, millions: { format: "{0} მილიონი" }, billions: { format: "{0} მილიარდი" }, trillions: { format: "{0} ტრილიონი" } },
    "kk": { thousands: { format: "{0} мың" }, millions: { format: "{0} млн" }, billions: { format: "{0} млрд" }, trillions: { format: "{0} трлн" } },
    "uz": { thousands: { format: "{0} ming" }, millions: { format: "{0} mln" }, billions: { format: "{0} mlrd" }, trillions: { format: "{0} trln" } },
    "ky": { thousands: { format: "{0} миң" }, millions: { format: "{0} млн" }, billions: { format: "{0} млрд" }, trillions: { format: "{0} трлн" } },
    "mn": { thousands: { format: "{0} мянга" }, millions: { format: "{0} сая" }, billions: { format: "{0} тэрбум" }, trillions: { format: "{0} их наяд" } },
    "tk": { thousands: { format: "{0} müň" }, millions: { format: "{0} mln" }, billions: { format: "{0} mlrd" }, trillions: { format: "{0} trln" } },
    "ug": { thousands: { format: "{0} مىڭ" }, millions: { format: "{0} مىليون" }, billions: { format: "{0} مىليارد" }, trillions: { format: "{0} تىرىليون" } },
    "tt": { thousands: { format: "{0} мең" }, millions: { format: "{0} млн" }, billions: { format: "{0} млрд" }, trillions: { format: "{0} трлн" } },
    "ba": { thousands: { format: "{0} мең" }, millions: { format: "{0} млн" }, billions: { format: "{0} млрд" }, trillions: { format: "{0} трлн" } },
    "be": { thousands: { format: "{0} тыс." }, millions: { format: "{0} млн" }, billions: { format: "{0} млрд" }, trillions: { format: "{0} трлн" } },
    "az": { thousands: { format: "{0} K" }, millions: { format: "{0} mln" }, billions: { format: "{0} mlrd" }, trillions: { format: "{0} trln" } },
    "sw": { thousands: { format: "{0} elfu" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "af": { thousands: { format: "{0} k" }, millions: { format: "{0} m." }, billions: { format: "{0} mjd." }, trillions: { format: "{0} bln." } },
    "am": { thousands: { format: "{0} ሺ" }, millions: { format: "{0} ሚሊዮን" }, billions: { format: "{0} ቢሊዮን" }, trillions: { format: "{0} ትሪሊዮን" } },
    "so": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "ha": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "ig": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "yo": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "zu": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "xh": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "tn": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "st": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "si": { thousands: { format: "{0} දහස" }, millions: { format: "{0} මිලියන" }, billions: { format: "{0} බිලියන" }, trillions: { format: "{0} ට්‍රිලියන" } },
    "ne": { thousands: { format: "{0} हजार" }, millions: { format: "{0} लाख" }, billions: { format: "{0} अर्ब" }, trillions: { format: "{0} खर्ब" } },
    "as": { thousands: { format: "{0} হাজাৰ" }, millions: { format: "{0} নিযুত" }, billions: { format: "{0} শত কোটি" }, trillions: { format: "{0} শত পৰাৰ্দ্ধ" } },
    "or": { thousands: { format: "{0} ହଜାର" }, millions: { format: "{0} ନିୟୁତ" }, billions: { format: "{0} ବିଲିୟନ" }, trillions: { format: "{0} ଟ୍ରିଲିୟନ" } },
    "km": { thousands: { format: "{0} ពាន់" }, millions: { format: "{0} លាន" }, billions: { format: "{0} ប៊ីលាន" }, trillions: { format: "{0} ទ្រីលាន" } },
    "lo": { thousands: { format: "{0} ພັນ" }, millions: { format: "{0} ລ້ານ" }, billions: { format: "{0} ຕື້" }, trillions: { format: "{0} ລ້ານລ້ານ" } },
    "bo": { thousands: { format: "{0} སྟོང" }, millions: { format: "{0} ས་ཡ" }, billions: { format: "{0} དུང་ཕྱུར" }, trillions: { format: "{0} བྱེ་བ" } },
    "my": { thousands: { format: "{0} ထောင်" }, millions: { format: "{0} သန်း" }, billions: { format: "{0} ဘီလီယံ" }, trillions: { format: "{0} ထရီလီယံ" } },
    "se": { thousands: { format: "{0} dt" }, millions: { format: "{0} mn" }, billions: { format: "{0} md" }, trillions: { format: "{0} bn" } },
    "fo": { thousands: { format: "{0} tús." }, millions: { format: "{0} mió." }, billions: { format: "{0} mia." }, trillions: { format: "{0} bió." } },
    "kl": { thousands: { format: "{0} tus." }, millions: { format: "{0} mio." }, billions: { format: "{0} mia." }, trillions: { format: "{0} bio." } },
    "lb": { thousands: { format: "{0} Dsd." }, millions: { format: "{0} Mio." }, billions: { format: "{0} Mrd." }, trillions: { format: "{0} Bio." } },
    "mt": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "br": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} G" }, trillions: { format: "{0} T" } },
    "co": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} Md" }, trillions: { format: "{0} Bn" } },
    "oc": { thousands: { format: "{0} k" }, millions: { format: "{0} M" }, billions: { format: "{0} Md" }, trillions: { format: "{0} Bn" } },
    "fy": { thousands: { format: "{0} K" }, millions: { format: "{0} mln." }, billions: { format: "{0} mld." }, trillions: { format: "{0} bln." } },
    "rm": { thousands: { format: "{0} mia" }, millions: { format: "{0} mio." }, billions: { format: "{0} mrd." }, trillions: { format: "{0} bio." } },
    "dv": { thousands: { format: "{0} ހާސް" }, millions: { format: "{0} މިލިއަން" }, billions: { format: "{0} ބިލިއަން" }, trillions: { format: "{0} ޓްރިލިއަން" } },
    "ps": { thousands: { format: "{0} زره" }, millions: { format: "{0} ملیون" }, billions: { format: "{0} ملیارد" }, trillions: { format: "{0} ټریلیون" } },
    "tg": { thousands: { format: "{0} ҳзр" }, millions: { format: "{0} млн" }, billions: { format: "{0} млрд" }, trillions: { format: "{0} трлн" } },
    "sa": { thousands: { format: "{0} सहस्र" }, millions: { format: "{0} दशलक्ष" }, billions: { format: "{0} अब्ज" }, trillions: { format: "{0} खर्व" } },
    "rw": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "wo": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "mi": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "iu": { thousands: { format: "{0} K" }, millions: { format: "{0} M" }, billions: { format: "{0} B" }, trillions: { format: "{0} T" } },
    "ii": { thousands: { format: "{0} ꀆ" }, millions: { format: "{0} ꃆ" }, billions: { format: "{0} ꀻ" }, trillions: { format: "{0} ꌕ" } },
};

/**
 * Gets display unit abbreviations for a given culture.
 * Falls back to language-only match if specific culture not found, then to English.
 * * @param cultureSelector - Locale code (e.g., "de-DE", "en-US")
 * @returns DisplayUnitAbbreviations object containing format and title.
 * * @example
 * getDisplayUnitsForCulture("de-DE") // → { thousands: { format: "{0} Tsd.", title: "Tausend" }, ... }
 * getDisplayUnitsForCulture("fr-CA") // → { thousands: { format: "{0} k", ... }, ... }
 */
export function getDisplayUnitsForCulture(cultureSelector: string): DisplayUnitAbbreviations {
    if (!cultureSelector) {
        return cldrDisplayUnits["en"];
    }

    // Try exact match first
    if (cldrDisplayUnits[cultureSelector]) {
        return cldrDisplayUnits[cultureSelector];
    }

    // Try language-only match (e.g., "de" for "de-DE")
    const language = cultureSelector.split("-")[0];
    if (cldrDisplayUnits[language]) {
        return cldrDisplayUnits[language];
    }

    // Fallback to English
    return cldrDisplayUnits["en"];
}

export function getAbbreviationFromExponent(exponent: number): DisplayUnitAbbreviationsMap {
    switch (exponent) {
        case 3:
            return "thousands";
        case 6:
            return "millions";
        case 9:
            return "billions";
        case 12:
            return "trillions";
        default:
            return null;
    }
}