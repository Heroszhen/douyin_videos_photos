import { Component, ElementRef, EventEmitter, Output, OnInit, ViewChild } from '@angular/core';
import { IData } from 'src/app/interfaces/IData';
import { Indexeddb } from 'src/app/indexeddb/indexeddb';
import { wait } from 'src/app/utils/util';

@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.scss']
})
export class LeftnavComponent implements OnInit {

  @ViewChild('div_leftnav') div!:ElementRef<HTMLDivElement>;
  @Output() installApp = new EventEmitter<IData>();
  indexeddb = new Indexeddb();
  constructor() { }

  ngOnInit(): void {
  }

  switchHidden(): void{
    this.div.nativeElement.classList.toggle('displayed')
  }

  installZooliclient(): void {
    this.installApp.emit({status:1, data:""});
  }

  async clearCache(): Promise<void> {
    let db:IDBDatabase = await this.indexeddb.opendDB();
    wait(0.1);
    for (let entry of this.indexeddb.TABLES_CACHE) {
      await this.indexeddb.empty(entry, db);
    }
    location.reload();
  }
}
