import { Model } from "./model";

export abstract class ZTabBase extends Model {
    public id: number|undefined;
    public title: string|null = null;
    public logo: string|null = null;
    public order:number|null = null;
}