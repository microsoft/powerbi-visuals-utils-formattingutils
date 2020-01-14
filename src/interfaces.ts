export interface ITextMeasurer {
    (textElement: SVGTextElement): number;
}

export interface ITextAsSVGMeasurer {
    (textProperties: TextProperties): number;
}

export interface ITextTruncator {
    (properties: TextProperties, maxWidth: number): string;
}

export interface TextProperties {
    text?: string;
    fontFamily: string;
    fontSize: string;
    fontWeight?: string;
    fontStyle?: string;
    fontVariant?: string;
    whiteSpace?: string;
}