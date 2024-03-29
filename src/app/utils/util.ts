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
    if ((str === null) || (str === ''))return "";
    else str = str.toString();

    return str.replace( /(<([^>]+)>)/ig, '');
}

export async function copyToClipboard(value:string, toAlert:boolean = true): Promise<void>{
    let input:HTMLInputElement = document.createElement("input");
    document.body.appendChild(input);
    input.value = value;
    input.focus();
    input.select();
    document.execCommand('copy');
    input.parentNode?.removeChild(input);
}

export function isMobile(): boolean {
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent))return true;

    return false;
}

export function isMobile2(): boolean {
    let useragent:string = navigator.userAgent.toLowerCase();
    const regex = RegExp('.*mobile.*');
    if (regex.test(useragent)) return true;
    return false;
}

export function detecteBrowser(): string {
    let userAgent:string = navigator.userAgent.toLowerCase();
    if(userAgent.includes("firefox"))return "firefox";
    else if(userAgent.includes("edg"))return "edg";
    else if(userAgent.includes("safari")){
      if(userAgent.includes("chrome"))return "chrome";
      else return "safari";
    }
    
    return "";
}

export function readFile(file: File): Promise<any> {
    return new Promise((resolve, err) => {
      let reader = new FileReader();
      reader.onload = (e) => {
        resolve(e);
      };
      reader.readAsDataURL(file);
    });
}
