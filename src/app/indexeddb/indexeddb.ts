//https://www.npmjs.com/package/ngx-indexed-db
//https://github.com/firefox-devtools/profiler/blob/8436a874983faf0690b3dbba82d094859541ed76/src/types/indexeddb.js
export class Indexeddb { 
    readonly ZTAB_CATEGORY = 'ztab_category';
    readonly ZTAB_TAB = 'ztab_tab';
    readonly ZTAB_USER = 'ztab_user';
    readonly TABLES_CACHE:string[] = [
        'video', 
        this.ZTAB_CATEGORY, 
        this.ZTAB_TAB, 
        this.ZTAB_USER
    ];

    opendDB():Promise<IDBDatabase> {
        let db:IDBDatabase;
        let openRequest:IDBOpenDBRequest = window.indexedDB.open("joliesfilles", 2);

        return new Promise<IDBDatabase>((resolve, reject) => {
            openRequest.onupgradeneeded = () => {
                db = openRequest.result;
                this.createObjectStore(db);

                resolve(db);
            };
            openRequest.onsuccess = () => {
                db = openRequest.result;
                this.createObjectStore(db);
                
                resolve(db);
            };
        });
    }

    private createObjectStore(db:IDBDatabase): void {
        this.TABLES_CACHE.forEach((tab:string) => {
            if (!db.objectStoreNames.contains(tab)) {
                db.createObjectStore(tab, { keyPath: 'id', autoIncrement: true })
                    .createIndex('id', 'id', { unique: true });
            }
        });
    }

    get(table:string, db:IDBDatabase = null!): Promise<Array<object>> {
        return new Promise<Array<object>>(async(resolve, reject) => {
            db = db ?? await this.opendDB();
            let objectStore:IDBObjectStore = db.transaction([table], "readonly").objectStore(table);
            let tab:object[] = [];
            objectStore.openCursor().onsuccess = (event:Event) => {
                let cursor:IDBCursorWithValue = (event.target as IDBRequest).result;
                if (cursor) {
                    tab.push(JSON.parse(JSON.stringify(cursor.value)));
                    cursor.continue();
                } else {
                    resolve(tab);
                }
            };
        });
    }

    getById(table:string, id:number, db:IDBDatabase = null!): Promise<object> {
        return new Promise<object>(async(resolve, reject) => {
            db = db ?? await this.opendDB();
            let request: IDBRequest<object> = db.transaction([table], "readonly")
                .objectStore(table)
                .index("id")
                .get(id);
                
            request.onsuccess = () => {
                resolve(request.result);
            };
        });
    }

    add<T>(table:string, data:T, db:IDBDatabase = null!): Promise<number> {
        return new Promise(async(resolve, reject) => {
            db = db ?? await this.opendDB();
            let request:IDBRequest<IDBValidKey> = db.transaction([table], 'readwrite')
                .objectStore(table)
                .add(data);

            request.onsuccess = () => {
                resolve(request.result as number);
            };
        });
    }

    update<T>(table:string, data:T, db:IDBDatabase = null!): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            db = db ?? await this.opendDB();
            let request:IDBRequest<IDBValidKey> = db.transaction([table], 'readwrite')
                .objectStore(table)
                .put(data);

            request.onsuccess = () => {
                resolve(request.result as number);
            };
        });
    }

    empty(table:string, db:IDBDatabase = null!): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            db = db ?? await this.opendDB();
            let request:IDBRequest = db.transaction([table], 'readwrite')
                .objectStore(table)
                .clear();

            request.onsuccess = () => {resolve(true);};
            request.onerror = () => {resolve(false);};
        });
    }
}