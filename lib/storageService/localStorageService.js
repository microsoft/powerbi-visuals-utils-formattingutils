export class LocalStorageService {
    getData(key) {
        try {
            if (localStorage) {
                let value = localStorage[key];
                if (value) {
                    return JSON.parse(value);
                }
            }
        }
        catch (exception) { }
        return null;
    }
    setData(key, data) {
        try {
            if (localStorage) {
                localStorage[key] = JSON.stringify(data);
            }
        }
        catch (e) { }
    }
}
//# sourceMappingURL=localStorageService.js.map