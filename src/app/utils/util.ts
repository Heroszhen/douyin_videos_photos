export function wait(millisecondes: number): Promise<number> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(1);
        }, millisecondes * 1000);
    });
}

export function clone(data: object|Array<any>): object|Array<any> {
    return JSON.parse(JSON.stringify(data));
}

export function removeTags(str:string): string {
    if ((str===null) || (str===''))return "";
    else str = str.toString();

    return str.replace( /(<([^>]+)>)/ig, '');
}