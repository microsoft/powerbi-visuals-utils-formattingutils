import { TextProperties, ITextAsSVGMeasurer, ITextTruncator } from "./textMeasurementService";
export interface WordBreakerResult {
    start: number;
    end: number;
}
/**
 * Find the word nearest the cursor specified within content
 * @param index - point within content to search forward/backward from
 * @param content - string to search
*/
export declare function find(index: number, content: string): WordBreakerResult;
/**
 * Test for presence of breakers within content
 * @param content - string to test
*/
export declare function hasBreakers(content: string): boolean;
/**
 * Count the number of pieces when broken by BREAKERS_REGEX
 * ~2.7x faster than WordBreaker.split(content).length
 * @param content - string to break and count
*/
export declare function wordCount(content: string): number;
export declare function getMaxWordWidth(content: string, textWidthMeasurer: ITextAsSVGMeasurer, properties: TextProperties): number;
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
export declare function splitByWidth(content: string, properties: TextProperties, textWidthMeasurer: ITextAsSVGMeasurer, maxWidth: number, maxNumLines: number, truncator?: ITextTruncator): string[];
