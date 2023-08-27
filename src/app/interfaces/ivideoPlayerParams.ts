export interface IVideoPlayerParams {
    video:string,
    type:videoType,
    className:string
}

export enum videoType {
    Iframe,
    TickTok,
    Video,
    Html
}