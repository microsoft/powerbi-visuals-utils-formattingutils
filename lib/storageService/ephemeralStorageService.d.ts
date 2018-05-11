import { IStorageService } from "./iStorageService";
export declare class EphemeralStorageService implements IStorageService {
    private cache;
    private clearCacheTimerId;
    private clearCacheInterval;
    static defaultClearCacheInterval: number;
    constructor(clearCacheInterval?: number);
    getData(key: string): any;
    setData(key: string, data: any): void;
    private clearCache();
}
export declare const ephemeralStorageService: EphemeralStorageService;
