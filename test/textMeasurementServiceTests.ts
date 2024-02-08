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

import * as ephemeralStorage from "./../src/storageService/ephemeralStorageService";
import ephemeralStorageService = ephemeralStorage.ephemeralStorageService;
import verifyEllipsisActive from "./verifyEllipsisActive";
import { textMeasurementService, stringExtensions } from "./../src/index";
import { TextProperties } from "../src/interfaces";
import * as lodashClonedeep from "lodash.clonedeep";

// powerbi.extensibility.utils.test
import { testDom } from "powerbi-visuals-utils-testutils";
describe("Text measurement service", () => {
    let Ellipsis = "...";

    describe("measureSvgTextElementWidth", () => {
        it("svg text element", () => {
            let element = document.createElement("text")
            element.innerText = "PowerBI rocks!";
            css(element, {
                "font-family": "Arial",
                "font-size": "11px",
                "font-weight": "bold",
                "font-style": "italic",
                "white-space": "nowrap",
            });
            attachToDom(element);

            let width = textMeasurementService.measureSvgTextElementWidth(element);
            expect(width).toBeGreaterThan(50);
        });
    });

    it("measureSvgTextWidth", () => {
        let getTextWidth = (fontSize: number) => {
            let textProperties = getTextProperties(fontSize);
            return textMeasurementService.measureSvgTextWidth(textProperties);
        };

        expect(getTextWidth(10)).toBeLessThan(getTextWidth(12));
    });

    it("estimateSvgTextHeight", () => {
        let getTextHeight = (fontSize: number) => {
            let textProperties = getTextProperties(fontSize);
            return textMeasurementService.estimateSvgTextHeight(textProperties);
        };

        expect(getTextHeight(10)).toBeLessThan(getTextHeight(12));
    });

    it("estimateSvgTextBaselineDelta", () => {
        let getTextBaselineDelta = (fontSize: number) => {
            let textProperties = getTextProperties(fontSize);
            return textMeasurementService.estimateSvgTextBaselineDelta(textProperties);
        };

        expect(getTextBaselineDelta(10)).toBeLessThan(getTextBaselineDelta(20));
    });

    it("estimateSvgTextHeight numeric", () => {
        let getTextHeight = (fontSize: number, numeric) => {
            let textProperties = getTextProperties(fontSize);
            return textMeasurementService.estimateSvgTextHeight(textProperties, numeric);
        };

        expect(getTextHeight(12, true)).toBeLessThan(getTextHeight(12, false));
    });

    describe("estimate cache", () => {
        let setDataSpy: jasmine.Spy;

        beforeEach(() => {
            ephemeralStorageService["clearCache"]();
            setDataSpy = spyOn(ephemeralStorageService, "setData");
            setDataSpy.and.callThrough();
        });

        it("estimateSvgTextHeight does cache", () => {
            textMeasurementService.estimateSvgTextHeight(getTextProperties(10, "A", "RandomFont"));
            textMeasurementService.estimateSvgTextHeight(getTextProperties(10, "B", "RandomFont"));
            textMeasurementService.estimateSvgTextHeight(getTextProperties(14, "C", "RandomFont"));
            textMeasurementService.estimateSvgTextHeight(getTextProperties(14, "D", "RandomFont"));
            textMeasurementService.estimateSvgTextHeight(getTextProperties(10, "E", "RandomFont2"));
            textMeasurementService.estimateSvgTextHeight(getTextProperties(10, "F", "RandomFont2"));

            expect(setDataSpy.calls.count()).toBe(3);
        });

        it("estimateSvgTextBaselineDelta does cache", () => {
            textMeasurementService.estimateSvgTextBaselineDelta(getTextProperties(10, "A", "RandomFont"));
            textMeasurementService.estimateSvgTextBaselineDelta(getTextProperties(10, "B", "RandomFont"));
            textMeasurementService.estimateSvgTextBaselineDelta(getTextProperties(14, "C", "RandomFont"));
            textMeasurementService.estimateSvgTextBaselineDelta(getTextProperties(14, "D", "RandomFont"));
            textMeasurementService.estimateSvgTextBaselineDelta(getTextProperties(10, "E", "RandomFont2"));
            textMeasurementService.estimateSvgTextBaselineDelta(getTextProperties(10, "F", "RandomFont2"));

            expect(setDataSpy.calls.count()).toBe(3);
        });

        it("estimateSvgTextHeight does not cache when results are wrong", () => {
            let textProperties = getTextProperties(10, "A", "RandomFont");

            // Mock measureSvgTextRect() to mimic the behavior when the iframe is disconnected / hidden.
            let measureSvgTextRectSpy = spyOn(textMeasurementService, "measureSvgTextRect");
            measureSvgTextRectSpy.and.returnValue(<any>{
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            });

            let wrongHeight = textMeasurementService.estimateSvgTextHeight(textProperties);
            expect(wrongHeight).toBe(0);

            // Calling again with the same text properties should not retrieve the incorrect height from the cache.
            measureSvgTextRectSpy.and.callThrough();
            let correctHeight = textMeasurementService.estimateSvgTextHeight(textProperties);
            expect(correctHeight).toBeGreaterThan(0);
        });
    });

    it("measureSvgTextHeight", () => {
        let getTextHeight = (fontSize: number) => {
            let textProperties = getTextProperties(fontSize);
            return textMeasurementService.measureSvgTextHeight(textProperties);
        };

        expect(getTextHeight(10)).toBeLessThan(getTextHeight(12));
    });

    describe("measureSvgTextRect", () => {
        it("small text should be less than greater one", () => {
            const smallRect: SVGRect = textMeasurementService.measureSvgTextRect(getTextProperties(10));
            const largeRect: SVGRect = textMeasurementService.measureSvgTextRect(getTextProperties(14));

            expect(smallRect.height).toBeLessThan(largeRect.height);
            // the y point of the rect is at the top of the rect, the y point of the text is (almost) at the bottom of the text.
            // both y will be less than 0, testing the absolute y value.
            expect(Math.abs(smallRect.y)).toBeLessThan(Math.abs(largeRect.y));
        });

        it("should return the same SVGRect for the same configuration", () => {
            const firstCall: SVGRect = textMeasurementService.measureSvgTextRect(getTextProperties());
            const secondCall: SVGRect = textMeasurementService.measureSvgTextRect(getTextProperties());

            expect(secondCall.width).toBe(firstCall.width);
            expect(secondCall.height).toBe(firstCall.height);
            expect(secondCall.x).toBe(firstCall.x);
            expect(secondCall.y).toBe(firstCall.y);
        });
    });

    it("getMeasurementProperties", () => {
        let element = document.createElement("text")
        element.innerText ="PowerBI rocks!";
        css(element, {
            "font-family": "Arial",
            "font-size": "11px",
            "font-weight": "700", // 700 is bold: https://developer.mozilla.org/en/docs/Web/CSS/font-weight
            "font-style": "italic",
            "font-variant": "normal",
            "white-space": "nowrap",
        });
        attachToDom(element);

        let properties = textMeasurementService.getMeasurementProperties(element);
        let expectedProperties: TextProperties = {
            fontFamily: "Arial",
            fontSize: "11px",
            fontWeight: "700",
            fontStyle: "italic",
            whiteSpace: "nowrap",
            fontVariant: "normal",
            text: "PowerBI rocks!",
        };

        expect(properties).toEqual(expectedProperties);
    });

    describe("getSvgMeasurementProperties", () => {
        it("svg text element", () => {
            let svg = document.createElement("svg")
            let text = document.createElement("text")
            text.innerText ="PowerBI rocks!";
            css(text, {
                "font-family": "Arial",
                "font-size": "11px",
                "font-weight": "700",
                "font-style": "italic",
                "font-variant": "normal",
                "white-space": "nowrap",
            });
            svg.append(text);
            attachToDom(svg);

            let properties = textMeasurementService.getSvgMeasurementProperties(text);
            let expectedProperties: TextProperties = {
                fontFamily: "Arial",
                fontSize: "11px",
                fontWeight: "700",
                fontStyle: "italic",
                whiteSpace: "nowrap",
                fontVariant: "normal",
                text: "PowerBI rocks!",
            };

            expect(properties).toEqual(expectedProperties);
        });
    });

    fdescribe("getTailoredTextOrDefault", () => {
        it("without ellipsis", () => {
            let properties: TextProperties = {
                fontFamily: "Arial",
                fontSize: "11px",
                fontWeight: "700",
                fontStyle: "italic",
                whiteSpace: "nowrap",
                fontVariant: "normal",
                text: "PowerBI rocks!",
            };

            // Back up the original properties to make sure the service doesn't change them.
            let originalProperties = lodashClonedeep(properties);
            let text = textMeasurementService.getTailoredTextOrDefault(properties, 100);

            expect(text).toEqual("PowerBI rocks!");
            expect(properties).toEqual(originalProperties);
        });

        it("with ellipsis", () => {
            let properties: TextProperties = {
                fontFamily: "Arial",
                fontSize: "11px",
                fontWeight: "700",
                fontStyle: "italic",
                whiteSpace: "nowrap",
                fontVariant: "normal",
                text: "PowerBI rocks!",
            };

            // Back up the original properties to make sure the service doesn't change them.
            let originalProperties = lodashClonedeep(properties);
            let text = textMeasurementService.getTailoredTextOrDefault(properties, 45);

            expect(stringExtensions.endsWith(text, Ellipsis)).toBeTruthy();
            expect(stringExtensions.startsWithIgnoreCase(text, "Pow")).toBeTruthy();
            expect(properties).toEqual(originalProperties);
        });

        it("short string", () => {
            const MAX_WIDTH = 3;
            const ORIGINAL_TEXT = "1";

            let properties: TextProperties = {
                "fontFamily": "helvetica, arial, sans-serif",
                "fontSize": "10.666666666666666px",
                "text": ORIGINAL_TEXT,
            }
            let result = textMeasurementService.getTailoredTextOrDefault(properties, MAX_WIDTH);

            expect(result.length).toBeLessThanOrEqual(ORIGINAL_TEXT.length);
        })
    });

    describe("svgEllipsis", () => {
        it("with ellipsis", () => {
            let element = createSvgTextElement("PowerBI rocks!");
            attachToDom(element);
            textMeasurementService.svgEllipsis(element, 20);

            let text = element.textContent || "";
            expect(stringExtensions.endsWith(text, Ellipsis)).toBeTruthy();
        });

        it("without ellipsis", () => {
            let element = createSvgTextElement("PowerBI rocks!");
            attachToDom(element);

            textMeasurementService.svgEllipsis(element, 200);

            let text = element.textContent || "";
            expect(text).toEqual("PowerBI rocks!");
        });
    });

    describe("wordBreak", () => {
        it("with no breaks", () => {
            let originalText = "ContentWithNoBreaks!";
            let element = createSvgTextElement(originalText);
            attachToDom(element);

            textMeasurementService.wordBreak(element, 25 /* maxLength */, 20 * 1 /* maxHeight */);

            let text = element.textContent || "";
            expect(element.querySelectorAll("tspan").length).toBe(1);
            expect(stringExtensions.endsWith(text, Ellipsis)).toBeTruthy();
        });

        it("with breaks and ellipses", () => {
            let originalText = "PowerBI rocks!";
            let element = createSvgTextElement(originalText);
            attachToDom(element);

            textMeasurementService.wordBreak(element, 25 /* maxLength */, 20 * 2 /* maxHeight */);

            let text = element.textContent || "";
            expect(element.querySelectorAll("tspan").length).toBe(2);
            expect(text.match(RegExp(Ellipsis, "g"))?.length).toBe(2);
        });

        it("with breaks but forced to single line", () => {
            let originalText = "PowerBI rocks!";
            let element = createSvgTextElement(originalText);
            attachToDom(element);

            textMeasurementService.wordBreak(element, 25 /* maxLength */, 20 * 1 /* maxHeight */);

            let text = element.textContent || "";
            expect(element.querySelectorAll("tspan").length).toBe(1);
            expect(stringExtensions.endsWith(text, Ellipsis)).toBeTruthy();
        });

        it("with breaks but forced to single line due to low max height", () => {
            let originalText = "PowerBI rocks!";
            let element = createSvgTextElement(originalText);
            attachToDom(element);

            textMeasurementService.wordBreak(element, 25 /* maxLength */, 1 /* maxHeight */);

            let text = element.textContent || "";
            expect(element.querySelectorAll("tspan").length).toBe(1);
            expect(stringExtensions.endsWith(text, Ellipsis)).toBeTruthy();
        });

        it("with breaks multiple words on each line", () => {
            let originalText = "The Quick Brown Fox Jumped Over The Lazy Dog";
            let element = createSvgTextElement(originalText);
            attachToDom(element);

            textMeasurementService.wordBreak(element, 75 /* maxLength */, 20 * 3 /* maxHeight */);

            let text = element.textContent || "";
            expect(element.querySelectorAll("tspan").length).toBe(3);
            expect(stringExtensions.endsWith(text, Ellipsis)).toBeTruthy();
        });
    });

    describe("wordBreakOverflowingText", () => {
        it("with no breaks", () => {
            let originalText = "ContentWithNoBreaks!";
            let element = createSpanElement(originalText);
            attachToDom(element);

            textMeasurementService.wordBreakOverflowingText(<any>element, 25 /* maxLength */, 20 * 1 /* maxHeight */);
            let children = getChildren(element);
            expect(children.length).toBe(1);
            verifyEllipsisActive(children[0] as HTMLElement);
        });

        it("with breaks and ellipses", () => {
            let originalText = "PowerBI rocks!";
            let element = createSpanElement(originalText);
            attachToDom(element);

            textMeasurementService.wordBreakOverflowingText(<any>element, 25 /* maxLength */, 20 * 2 /* maxHeight */);

            let children = getChildren(element);
            expect(children.length).toBe(2);
            verifyEllipsisActive(children[0] as HTMLElement);
            verifyEllipsisActive(children[children.length - 1] as HTMLElement);
        });

        it("with breaks but forced to single line", () => {
            let originalText = "PowerBI rocks!";
            let element = createSpanElement(originalText);
            attachToDom(element);

            textMeasurementService.wordBreakOverflowingText(<any>element, 25 /* maxLength */, 20 * 1 /* maxHeight */);

            let children = getChildren(element);
            expect(children.length).toBe(1);
            verifyEllipsisActive(children[0] as HTMLElement);
        });

        it("with breaks but forced to single line due to low max height", () => {
            let originalText = "PowerBI rocks!";
            let element = createSpanElement(originalText);
            attachToDom(element);

            textMeasurementService.wordBreakOverflowingText(<any>element, 25 /* maxLength */, 1 /* maxHeight */);

            let children = getChildren(element);
            expect(children.length).toBe(1);
            verifyEllipsisActive(children[0] as HTMLElement);
        });

        it("with breaks multiple words on each line", () => {
            let originalText = "The Quick Brown Fox Jumped Over The Lazy Dog";
            let element = createSpanElement(originalText);
            attachToDom(element);

            textMeasurementService.wordBreakOverflowingText(<any>element, 75 /* maxLength */, 20 * 3 /* maxHeight */);

            let children = getChildren(element);
            expect(children.length).toBe(3);
            verifyEllipsisActive(children[0] as HTMLElement);
        });

        function getChildren(element: HTMLElement): Element[] {
            return Array.from(element.children);
        }
    });

    function attachToDom(element: HTMLElement | Element): HTMLElement {
        let dom = testDom("100px", "100px");
        dom.append(element);
        return dom;
    }

    function createSvgTextElement(text: string): SVGTextElement {
        const svgElement: SVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const svgTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        svgTextElement.textContent = text;
        svgElement.appendChild(svgTextElement);
        return svgTextElement;
    }

    function createSpanElement(text: string): HTMLElement {
        let element = document.createElement("span");
        element.innerText = text;

        return element;
    }

    function getTextProperties(
            fontSize: number = 10,
            text: string = "PowerBI rocks!",
            fontFamily: string = "Arial"
        ): TextProperties {
        return {
            fontFamily: fontFamily ? fontFamily : "Arial",
            fontSize: fontSize + "px",
            text: text ? text : "PowerBI rocks!",
        };
    }

    function css(element, style) {
        for (const property in style)
            element.style[property] = style[property];
    }
});
