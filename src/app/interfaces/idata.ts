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
