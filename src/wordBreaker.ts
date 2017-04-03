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

module powerbi.extensibility.utils.formatting.wordBreaker {
    import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
    import ITextAsSVGMeasurer = powerbi.extensibility.utils.formatting.ITextAsSVGMeasurer;
    import ITextTruncator = powerbi.extensibility.utils.formatting.ITextTruncator;

    export interface WordBreakerResult {
        start: number;
        end: number;
    }

    const SPACE = " ";
    const BREAKERS_REGEX = /[\s\n]+/g;

    function search(index: number, content: string, backward: boolean): number {
        if (backward) {
            for (let i = index - 1; i > -1; i--) {
                if (hasBreakers(content[i]))
                    return i + 1;
            }
        } else {
            for (let i = index, ilen = content.length; i < ilen; i++) {
                if (hasBreakers(content[i]))
                    return i;
            }
        }

        return backward ? 0 : content.length;
    }

    /**
     * Find the word nearest the cursor specified within content
     * @param index - point within content to search forward/backward from
     * @param content - string to search
    */
    export function find(index: number, content: string): WordBreakerResult {
        let result = { start: 0, end: 0 };
        if (content.length === 0) {
            return result;
        }

        result.start = search(index, content, true);
        result.end = search(index, content, false);
        return result;
    }

    /**
     * Test for presence of breakers within content
     * @param content - string to test
    */
    export function hasBreakers(content: string): boolean {
        BREAKERS_REGEX.lastIndex = 0;
        return BREAKERS_REGEX.test(content);
    }

    /**
     * Count the number of pieces when broken by BREAKERS_REGEX
     * ~2.7x faster than WordBreaker.split(content).length
     * @param content - string to break and count
    */
    export function wordCount(content: string): number {
        let count = 1;
        BREAKERS_REGEX.lastIndex = 0;
        BREAKERS_REGEX.exec(content);
        while (BREAKERS_REGEX.lastIndex !== 0) {
            count++;
            BREAKERS_REGEX.exec(content);
        }

        return count;
    }

    export function getMaxWordWidth(content: string, textWidthMeasurer: ITextAsSVGMeasurer, properties: TextProperties): number {
        let words = split(content);
        let maxWidth = 0;
        for (let w of words) {
            properties.text = w;
            maxWidth = Math.max(maxWidth, textWidthMeasurer(properties));
        }
        return maxWidth;
    }

    function split(content: string): string[] {
        return content.split(BREAKERS_REGEX);
    }

    function getWidth(content: string, properties: TextProperties, textWidthMeasurer: ITextAsSVGMeasurer): number {
        properties.text = content;
        return textWidthMeasurer(properties);
    }

    function truncate(content: string, properties: TextProperties, truncator: ITextTruncator, maxWidth: number): string {
        properties.text = content;
        return truncator(properties, maxWidth);
    }

    /**
     * Split content by breakers (words) and greedy fit as many words
     * into each index in the result based on max width and number of lines
     * e.g. Each index in result corresponds to a line of content
     *      when used by AxisHelper.LabelLayoutStrategy.wordBreak
     * @param content - string to split
     * @param properties - text properties to be used by @param:textWidthMeasurer
     * @param textWidthMeasurer - function to calculate width of given text content
     * @param maxWidth - maximum allowed width of text content in each result
     * @param maxNumLines - maximum number of results we will allow, valid values must be greater than 0
     * @param truncator - (optional) if specified, used as a function to truncate content to a given width
    */
    export function splitByWidth(
        content: string,
        properties: TextProperties,
        textWidthMeasurer: ITextAsSVGMeasurer,
        maxWidth: number,
        maxNumLines: number,
        truncator?: ITextTruncator): string[] {
        // Default truncator returns string as-is
        truncator = truncator ? truncator : (properties: TextProperties, maxWidth: number) => properties.text;

        let result: string[] = [];
        let words = split(content);

        let usedWidth = 0;
        let wordsInLine: string[] = [];

        for (let word of words) {
            // Last line? Just add whatever is left
            if ((maxNumLines > 0) && (result.length >= maxNumLines - 1)) {
                wordsInLine.push(word);
                continue;
            }

            // Determine width if we add this word
            // Account for SPACE we will add when joining...
            let wordWidth = wordsInLine.length === 0
                ? getWidth(word, properties, textWidthMeasurer)
                : getWidth(SPACE + word, properties, textWidthMeasurer);

            // If width would exceed max width,
            // then push used words and start new split result
            if (usedWidth + wordWidth > maxWidth) {
                // Word alone exceeds max width, just add it.
                if (wordsInLine.length === 0) {
                    result.push(truncate(word, properties, truncator, maxWidth));

                    usedWidth = 0;
                    wordsInLine = [];
                    continue;
                }

                result.push(truncate(wordsInLine.join(SPACE), properties, truncator, maxWidth));

                usedWidth = 0;
                wordsInLine = [];
            }

            // ...otherwise, add word and continue
            wordsInLine.push(word);
            usedWidth += wordWidth;
        }

        // Push remaining words onto result (if any)
        if (!_.isEmpty(wordsInLine)) {
            result.push(truncate(wordsInLine.join(SPACE), properties, truncator, maxWidth));
        }

        return result;
    }
}
