export interface IData {
    status:number,
    data:any
}

export interface ICache {
    content: Array<any>,
    type:CacheType,
    pageItem:number
}

export enum CacheType {
    Video,
    Actress,
    Photo
}
