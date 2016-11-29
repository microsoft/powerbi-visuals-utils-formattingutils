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

module powerbi.extensibility.utils.formatting.font {
    export class FamilyInfo {
        constructor(public families: string[]) { };

        /**
         * Gets the first font "wf_" font family since it will always be loaded.
         */
        get family(): string {
            return this.getFamily();
        }

        /**
        * Gets the first font family that matches regex (if provided).
        * Default regex looks for "wf_" fonts which are always loaded.
        */
        getFamily(regex: RegExp = /^wf_/): string {
            if (!this.families) {
                return null;
            }

            return regex ? _.find(this.families, (fontFamily) => regex.test(fontFamily)) : this.families[0];
        }

        /**
         * Gets the CSS string for the "font-family" CSS attribute.
         */
        get css(): string {
            return this.getCSS();
        }

        /**
         * Gets the CSS string for the "font-family" CSS attribute.
         */
        getCSS(): string {
            return this.families ? this.families.map((font => font.indexOf(" ") > 0 ? `'` + font + `'` : font)).join(", ") : null;
        }
    }
}
