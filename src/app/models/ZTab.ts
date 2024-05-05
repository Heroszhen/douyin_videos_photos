import { ZTabBase } from "./ZTabBase";

export class ZTab extends ZTabBase {
    public link: string|null = null;
    public categoryId:number|null = null;
    
    constructor() {
        super();
    }
}