import { ZTab } from "./ZTab";
import { Model } from "./model";

export class ZTabUser extends Model {
    public id:number|undefined;
    public name:string|null = null;
    public photo:string|null = null;
    public backgroundPhoto:string|null = null;
    public webSites:Partial<ZTab>[] = [];
    public slogan:string|null = null;

    constructor() {
        super();
    }
}