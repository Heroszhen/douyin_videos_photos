export class Indexeddb { 
    readonly TABLES:string[] = ["video"];

    opendDB():Promise<IDBDatabase> {
        let db:IDBDatabase;
        let openRequest:IDBOpenDBRequest = window.indexedDB.open("joliesfilles", 1);

        return new Promise((resolve, reject) => {
            openRequest.onupgradeneeded = (event) => {
                db = openRequest.result;
                this.TABLES.forEach((table:string) => {

                })
                if (!db.objectStoreNames.contains("link")) {
                    db.createObjectStore("link", { keyPath: 'id', autoIncrement: true })
                        .createIndex('id', 'id', { unique: true });
                }
                if (!db.objectStoreNames.contains("series")) {
                    db.createObjectStore("series", { keyPath: 'id', autoIncrement: true })
                        .createIndex('id', 'id', { unique: true });
                }
                resolve(db);
            }
            openRequest.onsuccess = function () {
                db = openRequest.result;
                resolve(db);
            }
        });
    }
}