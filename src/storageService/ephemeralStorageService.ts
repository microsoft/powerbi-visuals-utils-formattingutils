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

module powerbi.extensibility.utils.formatting {
    export class EphemeralStorageService implements IStorageService {
        private cache: { [key: string]: any } = {};
        private clearCacheTimerId: number;
        private clearCacheInterval: number;
        public static defaultClearCacheInterval: number = (1000 * 60 * 60 * 24);  // 1 day

        constructor(clearCacheInterval?: number) {
            this.clearCacheInterval = (clearCacheInterval != null)
                ? clearCacheInterval
                : EphemeralStorageService.defaultClearCacheInterval;

            this.clearCache();
        }

        public getData(key: string): any {
            return this.cache[key];
        }

        public setData(key: string, data: any) {
            this.cache[key] = data;

            if (this.clearCacheTimerId == null) {
                this.clearCacheTimerId = setTimeout(() => this.clearCache(), this.clearCacheInterval);
            }
        }

        private clearCache(): void {
            this.cache = {};
            this.clearCacheTimerId = undefined;
        }
    }

    export const ephemeralStorageService: EphemeralStorageService = new EphemeralStorageService();
}
