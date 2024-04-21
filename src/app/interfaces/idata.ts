export interface IData {
    status:number,
    data:any
}

export enum CacheType {
    Video,
    Actress,
    Photo
}

export interface IVideo {
    actressname:string,
    created:string,
    description?:string
    id:number,
    last:number,
    name:string,
    phototype:number,
    photourl:string,
    siteurl:string,
    videotype:number,
    videourl:string
}

export interface IPhoto {
    id:number,
    name:string,
    photoname:string,
    photourl:string,
    actress:{name:string}|null
}

export interface IActress {
    id:number,
    name:string,
    photourl:string
}

export type IApiPlatform = {
    '@context': string,
    '@id': string,
    '@type': string,
    'hydra:member': any[]
}
