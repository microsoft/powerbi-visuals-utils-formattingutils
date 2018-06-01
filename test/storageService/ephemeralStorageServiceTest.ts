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


import * as ephemeralStorageService from "./../../src/storageService/ephemeralStorageService";
import EphemeralStorageService = ephemeralStorageService.EphemeralStorageService;

describe("Ephemeral Storage Service", () => {
    it("get with existing key retrieves data", () => {
        let storage = new EphemeralStorageService();

        storage.setData("key", "value");

        let value = storage.getData("key");

        expect(value).toBe("value");
    });

    it("get with non-existing key returns null", () => {
        let storage = new EphemeralStorageService();

        storage.setData("key1", "value");

        let value = storage.getData("key2");

        expect(value == null).toBeTruthy();
    });

    it("cache is cleared after interval", (done) => {
        let timeout = 10;
        let storage = new EphemeralStorageService(timeout);

        storage.setData("key", "value");

        setTimeout(() => {
            // cache should be cleared by now
            let value = storage.getData("key");
            expect(value == null).toBeTruthy();
            done();
        }, timeout + 10);
    });
});
