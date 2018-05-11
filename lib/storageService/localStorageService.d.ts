import { IStorageService } from "./iStorageService";
export declare class LocalStorageService implements IStorageService {
    getData(key: string): any;
    setData(key: string, data: any): void;
}
