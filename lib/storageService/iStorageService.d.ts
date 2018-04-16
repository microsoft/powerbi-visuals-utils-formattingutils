export interface IStorageService {
    getData(key: string): any;
    setData(key: string, data: any): void;
}
