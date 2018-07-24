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

// powerbi.extensibility.utils.type
import { pixelConverter as PixelConverter, prototype as Prototype } from "powerbi-visuals-utils-typeutils";

// powerbi.extensibility.utils.formatting
import * as wordBreaker from "./wordBreaker";
import { ephemeralStorageService } from "./storageService/ephemeralStorageService";

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

interface CanvasContext {
    font: string;
    measureText(text: string): { width: number };
}

interface CanvasElement extends HTMLElement {
    getContext(name: string);
}

export module textMeasurementService {
    const ellipsis = "...";

    let spanElement: HTMLElement;
    let svgTextElement: SVGTextElement;
    let canvasCtx: CanvasContext;
    let fallbackFontFamily: string;

    /**
     * Idempotent function for adding the elements to the DOM.
     */
    function ensureDOM(): void {
        if (spanElement) {
            return;
        }

        spanElement = document.createElement("span");
        document.body.appendChild(spanElement);
        // The style hides the svg element from the canvas, preventing canvas from scrolling down to show svg black square.
        const svgElement: SVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("height", "0");
        svgElement.setAttribute("width", "0");
        svgElement.setAttribute("position", "absolute");
        svgTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        svgElement.appendChild(svgTextElement);
        document.body.appendChild(svgElement);
        let canvasElement: CanvasElement = document.createElement("canvas");
        canvasCtx = canvasElement.getContext("2d");
        let style: CSSStyleDeclaration = window.getComputedStyle(svgTextElement);
        if (style) {
            fallbackFontFamily = style.fontFamily;
        } else {
            fallbackFontFamily = "";
        }
    }

    /**
     * Removes spanElement from DOM.
     */
    export function removeSpanElement() {
        if (spanElement && spanElement.remove) {
            spanElement.remove();
        }

        spanElement = null;
    }

    /**
     * This method measures the width of the text with the given SVG text properties.
     * @param textProperties The text properties to use for text measurement.
     * @param text The text to measure.
     */
    export function measureSvgTextWidth(textProperties: TextProperties, text?: string): number {
        ensureDOM();

        canvasCtx.font =
            (textProperties.fontStyle || "") + " " +
            (textProperties.fontVariant || "") + " " +
            (textProperties.fontWeight || "") + " " +
            textProperties.fontSize + " " +
            (textProperties.fontFamily || fallbackFontFamily);

        return canvasCtx.measureText(text || textProperties.text).width;
    }

    /**
     * This method return the rect with the given SVG text properties.
     * @param textProperties The text properties to use for text measurement.
     * @param text The text to measure.
     */
    export function measureSvgTextRect(textProperties: TextProperties, text?: string): SVGRect {
        ensureDOM();

        // Removes DOM elements faster than innerHTML
        while (svgTextElement.firstChild) {
            svgTextElement.removeChild(svgTextElement.firstChild);
        }

        svgTextElement.setAttribute("style", null);

        svgTextElement.style.visibility = "hidden";
        svgTextElement.style.fontFamily = textProperties.fontFamily || fallbackFontFamily;
        svgTextElement.style.fontVariant = textProperties.fontVariant;
        svgTextElement.style.fontSize = textProperties.fontSize;
        svgTextElement.style.fontWeight = textProperties.fontWeight;
        svgTextElement.style.fontStyle = textProperties.fontStyle;
        svgTextElement.style.whiteSpace = textProperties.whiteSpace || "nowrap";
        svgTextElement.appendChild(document.createTextNode(text || textProperties.text));

        // We're expecting the browser to give a synchronous measurement here
        // We're using SVGTextElement because it works across all browsers
        return svgTextElement.getBBox();
    }

    /**
     * This method measures the height of the text with the given SVG text properties.
     * @param textProperties The text properties to use for text measurement.
     * @param text The text to measure.
     */
    export function measureSvgTextHeight(textProperties: TextProperties, text?: string): number {
        return measureSvgTextRect(textProperties, text).height;
    }

    /**
     * This method returns the text Rect with the given SVG text properties.
     * Does NOT return text width; obliterates text value
     * @param {TextProperties} textProperties - The text properties to use for text measurement
     */
    function estimateSvgTextRect(textProperties: TextProperties): SVGRect {
        let propertiesKey = textProperties.fontFamily + textProperties.fontSize;
        let rect: SVGRect = ephemeralStorageService.getData(propertiesKey);

        if (rect == null) {
            // To estimate we check the height of a particular character, once it is cached, subsequent
            // calls should always get the height from the cache (regardless of the text).
            let estimatedTextProperties: TextProperties = {
                fontFamily: textProperties.fontFamily,
                fontSize: textProperties.fontSize,
                text: "M",
            };

            rect = textMeasurementService.measureSvgTextRect(estimatedTextProperties);

            // NOTE: In some cases (disconnected/hidden DOM) we may provide incorrect measurement results (zero sized bounding-box), so
            // we only store values in the cache if we are confident they are correct.
            if (rect.height > 0)
                ephemeralStorageService.setData(propertiesKey, rect);
        }

        return rect;
    }

    /**
     * This method returns the text Rect with the given SVG text properties.
     * @param {TextProperties} textProperties - The text properties to use for text measurement
     */
    export function estimateSvgTextBaselineDelta(textProperties: TextProperties): number {
        let rect = estimateSvgTextRect(textProperties);
        return rect.y + rect.height;
    }

    /**
     * This method estimates the height of the text with the given SVG text properties.
     * @param {TextProperties} textProperties - The text properties to use for text measurement
     */
    export function estimateSvgTextHeight(textProperties: TextProperties, tightFightForNumeric: boolean = false): number {
        let height = estimateSvgTextRect(textProperties).height;

        // TODO: replace it with new baseline calculation
        if (tightFightForNumeric)
            height *= 0.7;

        return height;
    }

    /**
     * This method measures the width of the svgElement.
     * @param svgElement The SVGTextElement to be measured.
     */
    export function measureSvgTextElementWidth(svgElement: Element): number {
        return measureSvgTextWidth(getSvgMeasurementProperties(svgElement));
    }

    /**
     * This method fetches the text measurement properties of the given DOM element.
     * @param element The selector for the DOM Element.
     */
    export function getMeasurementProperties(element: Element): TextProperties {
        const style: CSSStyleDeclaration = window.getComputedStyle(element);
        return {
            text: (<HTMLInputElement>element).value || element.textContent,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            fontStyle: style.fontStyle,
            fontVariant: style.fontVariant,
            whiteSpace: style.whiteSpace
        };
    }

    /**
     * This method fetches the text measurement properties of the given SVG text element.
     * @param element The SVGTextElement to be measured.
     */
    export function getSvgMeasurementProperties(element: Element): TextProperties {
        let style: CSSStyleDeclaration = window.getComputedStyle(element);
        if (style) {
            return {
                text: element.textContent,
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                fontStyle: style.fontStyle,
                fontVariant: style.fontVariant,
                whiteSpace: style.whiteSpace
            };
        } else {
            return {
                text: element.textContent,
                fontFamily: "",
                fontSize: "0",
            };
        }
    }

    /**
     * This method returns the width of a div element.
     * @param element The div element.
     */
    export function getDivElementWidth(element: Element): string {
        const style: CSSStyleDeclaration = window.getComputedStyle(element);
        if (style)
            return style.width;
        else
            return "0";
    }

    /**
     * Compares labels text size to the available size and renders ellipses when the available size is smaller.
     * @param textProperties The text properties (including text content) to use for text measurement.
     * @param maxWidth The maximum width available for rendering the text.
     */
    export function getTailoredTextOrDefault(textProperties: TextProperties, maxWidth: number): string {
        ensureDOM();

        let strLength: number = textProperties.text.length;

        if (strLength === 0) {
            return textProperties.text;
        }

        let width: number = measureSvgTextWidth(textProperties);

        if (width < maxWidth) {
            return textProperties.text;
        }

        // Create a copy of the textProperties so we don't modify the one that's passed in.
        let copiedTextProperties = Prototype.inherit(textProperties);

        // Take the properties and apply them to svgTextElement
        // Then, do the binary search to figure out the substring we want
        // Set the substring on textElement argument
        let text = copiedTextProperties.text = ellipsis + copiedTextProperties.text;

        let min = 1;
        let max = text.length;
        let i = ellipsis.length;

        while (min <= max) {
            // num | 0 prefered to Math.floor(num) for performance benefits
            i = (min + max) / 2 | 0;

            copiedTextProperties.text = text.substr(0, i);
            width = measureSvgTextWidth(copiedTextProperties);

            if (maxWidth > width) {
                min = i + 1;
            } else if (maxWidth < width) {
                max = i - 1;
            } else {
                break;
            }
        }

        // Since the search algorithm almost never finds an exact match,
        // it will pick one of the closest two, which could result in a
        // value bigger with than 'maxWidth' thus we need to go back by
        // one to guarantee a smaller width than 'maxWidth'.
        copiedTextProperties.text = text.substr(0, i);
        width = measureSvgTextWidth(copiedTextProperties);
        if (width > maxWidth) {
            i--;
        }

        return text.substr(ellipsis.length, i - ellipsis.length) + ellipsis;
    }

    /**
     * Compares labels text size to the available size and renders ellipses when the available size is smaller.
     * @param textElement The SVGTextElement containing the text to render.
     * @param maxWidth The maximum width available for rendering the text.
     */
    export function svgEllipsis(textElement: Element, maxWidth: number): void {
        let properties: TextProperties = getSvgMeasurementProperties(textElement);
        let originalText: string = properties.text;
        let tailoredText: string = getTailoredTextOrDefault(properties, maxWidth);

        if (originalText !== tailoredText) {
            textElement.textContent = tailoredText;
        }
    }

    /**
     * Word break textContent of <text> SVG element into <tspan>s
     * Each tspan will be the height of a single line of text
     * @param textElement - the SVGTextElement containing the text to wrap
     * @param maxWidth - the maximum width available
     * @param maxHeight - the maximum height available (defaults to single line)
     * @param linePadding - (optional) padding to add to line height
     */
    export function wordBreak(textElement: Element, maxWidth: number, maxHeight: number, linePadding: number = 0): void {
        let properties: TextProperties = getSvgMeasurementProperties(textElement);
        let height: number = estimateSvgTextHeight(properties) + linePadding;
        let maxNumLines: number = Math.max(1, Math.floor(maxHeight / height));

        // Save y of parent textElement to apply as first tspan dy
        let firstDY: string = textElement ? textElement.getAttribute("y") : null;

        // Store and clear text content
        let labelText = textElement ? textElement.textContent : null;
        textElement.textContent = null;

        // Append a tspan for each word broken section
        let words = wordBreaker.splitByWidth(labelText, properties, measureSvgTextWidth, maxWidth, maxNumLines);
        const fragment: DocumentFragment = document.createDocumentFragment();
        for (let i = 0, ilen = words.length; i < ilen; i++) {
            const dy = i === 0 ? firstDY : height;
            properties.text = words[i];
            const textElement: SVGTSpanElement = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            textElement.setAttribute("x", "0");
            textElement.setAttribute("dy", dy ? dy.toString() : null);
            textElement.appendChild(document.createTextNode(getTailoredTextOrDefault(properties, maxWidth)));
            fragment.appendChild(textElement);
        }
        textElement.appendChild(fragment);
    }

    /**
     * Word break textContent of span element into <span>s
     * Each span will be the height of a single line of text
     * @param textElement - the element containing the text to wrap
     * @param maxWidth - the maximum width available
     * @param maxHeight - the maximum height available (defaults to single line)
     * @param linePadding - (optional) padding to add to line height
     */
    export function wordBreakOverflowingText(textElement: SVGTextElement, maxWidth: number, maxHeight: number, linePadding: number = 0): void {
        const properties: TextProperties = getSvgMeasurementProperties(textElement);
        let height: number = estimateSvgTextHeight(properties) + linePadding;
        let maxNumLines: number = Math.max(1, Math.floor(maxHeight / height));

        // Store and clear text content
        const labelText: string = textElement.textContent;
        textElement.textContent = null;

        // Append a span for each word broken section
        const words: string[] = wordBreaker.splitByWidth(labelText, properties, measureSvgTextWidth, maxWidth, maxNumLines);
        const fragment: DocumentFragment = document.createDocumentFragment();
        for (let i = 0; i < words.length; i++) {
            const span: HTMLSpanElement = document.createElement("span");
            span.classList.add("overflowingText");
            span.style.overflow = "hidden";
            span.style.whiteSpace = "nowrap";
            span.style.textOverflow = "ellipsis";
            span.style.display = "block";
            span.style.width = PixelConverter.toString(maxWidth);
            span.appendChild(document.createTextNode(words[i]));
            span.appendChild(document.createTextNode(getTailoredTextOrDefault(properties, maxWidth)));
            fragment.appendChild(span);
        }
        textElement.appendChild(fragment);
    }
}
