import { Component, ElementRef, EventEmitter, Output, OnInit, ViewChild } from '@angular/core';
import { IData } from 'src/app/interfaces/IData';
import { Indexeddb } from 'src/app/indexeddb/indexeddb';
import { wait } from 'src/app/utils/util';
import { StoreService } from 'src/app/services/store.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.scss']
})
export class LeftnavComponent implements OnInit {

  @ViewChild('div_leftnav') div!:ElementRef<HTMLDivElement>;
  @Output() installApp = new EventEmitter<IData>();
  @Output() login = new EventEmitter<IData>();
  indexeddb = new Indexeddb();
  isConnected:boolean = false;
  constructor(private storeService:StoreService, private router:Router) { }

  ngOnInit(): void {
    this.storeService.connected$.subscribe((data:boolean[])=>{
      this.isConnected = data[0];
    });
  }

  switchHidden(): void{
    this.div.nativeElement.classList.toggle('displayed');
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

  toLogin():void {
    this.login.emit({status:1, data:""});
  }

  deconnect():void {
    localStorage.removeItem('token');
    this.storeService.connected$.next([false]);
    this.router.navigate(['/']);
  }
}
