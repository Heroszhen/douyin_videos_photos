//https://www.npmjs.com/package/ngx-indexed-db
//https://github.com/firefox-devtools/profiler/blob/8436a874983faf0690b3dbba82d094859541ed76/src/types/indexeddb.js
export class Indexeddb { 

    opendDB():Promise<IDBDatabase> {
        let db:IDBDatabase;
        let openRequest:IDBOpenDBRequest = window.indexedDB.open("joliesfilles", 1);

        return new Promise<IDBDatabase>((resolve, reject) => {
            openRequest.onupgradeneeded = () => {
                db = openRequest.result;
                if (!db.objectStoreNames.contains('video')) {
                    db.createObjectStore('video', { keyPath: 'id', autoIncrement: true })
                        .createIndex('id', 'id', { unique: true });
                }
                resolve(db);
            }
            openRequest.onsuccess = () => {
                db = openRequest.result;
                resolve(db);
            }
        });
    }

    get(table:string, db:IDBDatabase = null!): Promise<Array<object>> {
        return  new Promise<Array<object>>(async(resolve, reject) => {
            db = db ?? await this.opendDB();
            let objectStore:IDBObjectStore = db.transaction([table], "readonly").objectStore(table);
            let tab:object[] = [];
            objectStore.openCursor().onsuccess =  (event:Event) => {
                let cursor:IDBCursorWithValue = (event.target as IDBRequest).result;
                if (cursor) {
                    tab.push(JSON.parse(JSON.stringify(cursor.value)));
                    cursor.continue();
                } else {
                    resolve(tab);
                }
            }
        });
    }

    getById(table:string, id:number, db:IDBDatabase = null!): Promise<object> {
        return new Promise<object>(async(resolve, reject) => {
            db = db ?? await this.opendDB();
            let request: IDBRequest<any> = db.transaction([table], "readonly")
                .objectStore(table)
                .index("id")
                .get(id);
                
            request.onsuccess = () => {
                resolve(request.result);
            }
        });
    }

    add(table:string, data:any, db:IDBDatabase = null!): Promise<number> {
        return new Promise((resolve, reject) => {
            let request:IDBRequest<IDBValidKey> = db.transaction([table], 'readwrite')
                .objectStore(table)
                .add(data);

            request.onsuccess = () => {
                resolve(request.result as number);
            }
        });
    }

    update(table:string, data:any, db:IDBDatabase = null!): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            let request:IDBRequest<IDBValidKey> = db.transaction([table], 'readwrite')
                .objectStore(table)
                .put(data);

            request.onsuccess = () => {
                resolve(request.result as number);
            }
        });
    }
}