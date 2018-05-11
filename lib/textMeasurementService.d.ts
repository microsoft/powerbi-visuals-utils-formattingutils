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
export declare module textMeasurementService {
    /**
     * Removes spanElement from DOM.
     */
    function removeSpanElement(): void;
    /**
     * This method measures the width of the text with the given SVG text properties.
     * @param textProperties The text properties to use for text measurement.
     * @param text The text to measure.
     */
    function measureSvgTextWidth(textProperties: TextProperties, text?: string): number;
    /**
     * This method return the rect with the given SVG text properties.
     * @param textProperties The text properties to use for text measurement.
     * @param text The text to measure.
     */
    function measureSvgTextRect(textProperties: TextProperties, text?: string): SVGRect;
    /**
     * This method measures the height of the text with the given SVG text properties.
     * @param textProperties The text properties to use for text measurement.
     * @param text The text to measure.
     */
    function measureSvgTextHeight(textProperties: TextProperties, text?: string): number;
    /**
     * This method returns the text Rect with the given SVG text properties.
     * @param {TextProperties} textProperties - The text properties to use for text measurement
     */
    function estimateSvgTextBaselineDelta(textProperties: TextProperties): number;
    /**
     * This method estimates the height of the text with the given SVG text properties.
     * @param {TextProperties} textProperties - The text properties to use for text measurement
     */
    function estimateSvgTextHeight(textProperties: TextProperties, tightFightForNumeric?: boolean): number;
    /**
     * This method measures the width of the svgElement.
     * @param svgElement The SVGTextElement to be measured.
     */
    function measureSvgTextElementWidth(svgElement: Element): number;
    /**
     * This method fetches the text measurement properties of the given DOM element.
     * @param element The selector for the DOM Element.
     */
    function getMeasurementProperties(element: Element): TextProperties;
    /**
     * This method fetches the text measurement properties of the given SVG text element.
     * @param element The SVGTextElement to be measured.
     */
    function getSvgMeasurementProperties(element: Element): TextProperties;
    /**
     * This method returns the width of a div element.
     * @param element The div element.
     */
    function getDivElementWidth(element: Element): string;
    /**
     * Compares labels text size to the available size and renders ellipses when the available size is smaller.
     * @param textProperties The text properties (including text content) to use for text measurement.
     * @param maxWidth The maximum width available for rendering the text.
     */
    function getTailoredTextOrDefault(textProperties: TextProperties, maxWidth: number): string;
    /**
     * Compares labels text size to the available size and renders ellipses when the available size is smaller.
     * @param textElement The SVGTextElement containing the text to render.
     * @param maxWidth The maximum width available for rendering the text.
     */
    function svgEllipsis(textElement: Element, maxWidth: number): void;
    /**
     * Word break textContent of <text> SVG element into <tspan>s
     * Each tspan will be the height of a single line of text
     * @param textElement - the SVGTextElement containing the text to wrap
     * @param maxWidth - the maximum width available
     * @param maxHeight - the maximum height available (defaults to single line)
     * @param linePadding - (optional) padding to add to line height
     */
    function wordBreak(textElement: Element, maxWidth: number, maxHeight: number, linePadding?: number): void;
    /**
     * Word break textContent of span element into <span>s
     * Each span will be the height of a single line of text
     * @param textElement - the element containing the text to wrap
     * @param maxWidth - the maximum width available
     * @param maxHeight - the maximum height available (defaults to single line)
     * @param linePadding - (optional) padding to add to line height
     */
    function wordBreakOverflowingText(textElement: SVGTextElement, maxWidth: number, maxHeight: number, linePadding?: number): void;
}
