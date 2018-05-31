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
/**
 * Contains functions/constants to aid in text manupilation.
 */
/**
 * Remove breaking spaces from given string and replace by none breaking space (&nbsp).
 */
export function removeBreakingSpaces(str) {
    return str.toString().replace(new RegExp(" ", "g"), "&nbsp");
}
/**
 * Remove ellipses from a given string
 */
export function removeEllipses(str) {
    return str.replace(/(…)|(\.\.\.)/g, "");
}
/**
* Replace every whitespace (0x20) with Non-Breaking Space (0xA0)
    * @param {string} txt String to replace White spaces
    * @returns Text after replcing white spaces
    */
export function replaceSpaceWithNBSP(txt) {
    if (txt != null) {
        return txt.replace(/ /g, "\xA0");
    }
}
//# sourceMappingURL=textUtil.js.map