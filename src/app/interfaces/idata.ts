export interface IData {
    status:number,
    data:any
}

export interface ICache {
    content: Array<any>,
    type:CacheType,
    pageItem:number,
    elmindex:number
}

export enum CacheType {
    Video,
    Actress,
    Photo
}
