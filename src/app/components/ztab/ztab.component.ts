import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import env from '../../../assets/env.local.json';
import { wait } from 'src/app/utils/util';
import { Indexeddb } from 'src/app/indexeddb/indexeddb';
import { ZTabCategory } from 'src/app/models/ZTabCategory';
import { ZTab } from 'src/app/models/ZTab';
import { ZTabUser } from 'src/app/models/ZTabUser';

@Component({
  selector: 'app-ztab',
  templateUrl: './ztab.component.html',
  styleUrls: ['./ztab.component.scss']
})
export class ZtabComponent implements OnInit, AfterViewInit {
  section:number = 1;
  indexedDB:Indexeddb = new Indexeddb();
  indexedDB_db:IDBDatabase;
  allCategorys: Array<ZTabCategory> = [];
  allTabs: Array<ZTab> = [];
  ztabUser: ZTabUser = new ZTabUser();
  categoryId:number|null = null;
  categoryM: ZTabCategory;
  tabM: ZTab;
  @ViewChild('ztabsection') ztabSection: ElementRef<HTMLElement>;
  elmIndex:number|null = null;
  //1:form-ztabUser-website-form
  formType:number|null = null;
  showListWebsites:boolean = false;
  @ViewChild('section_form') sectionForm: ElementRef<HTMLElement>;

  constructor() {
    this.getDB();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    let imageUrl:string = this.ztabUser.backgroundPhoto ?? 'assets/photos/ad_loader.png';
    this.ztabSection.nativeElement.style.background = `url(${imageUrl}) no-repeat`;
    this.ztabSection.nativeElement.style.backgroundSize = `cover`;
  }

  async getDB(): Promise<void> {
    this.indexedDB_db = await this.indexedDB.opendDB();
    await wait(0.4);

    this.indexedDB.get(this.indexedDB.ZTAB_USER, this.indexedDB_db).then((data:Array<object>) => {
      if (data[0])this.ztabUser = data[0] as ZTabUser;
      else {
        this.ztabUser.webSites = env['ztab']['user']['webSites'];
      }
    });

    this.allCategorys = (await this.indexedDB.get(this.indexedDB.ZTAB_CATEGORY, this.indexedDB_db)) as Array<ZTabCategory>;
    if (this.allCategorys.length === 0) {
      this.categoryM = new ZTabCategory();
      this.categoryM.assignData(env['ztab']['category']);
      let id:number = await this.indexedDB.add(this.indexedDB.ZTAB_CATEGORY, this.categoryM)
      let category:ZTabCategory = (await this.indexedDB.getById(this.indexedDB.ZTAB_CATEGORY, id, this.indexedDB_db)) as ZTabCategory;
      this.allCategorys.push(category);

      this.tabM = new ZTab();
      this.tabM.assignData(env['ztab']['tab']);
      this.tabM['categoryId'] = id;
      await this.indexedDB.add(this.indexedDB.ZTAB_TAB, this.tabM);
    }

    this.indexedDB.get(this.indexedDB.ZTAB_TAB, this.indexedDB_db).then((data:Array<object>) => {
      this.allTabs = data as Array<ZTab>;
    });
  }

  clickOnZtab(): void {
    this.showListWebsites = false;
    this.sectionForm.nativeElement.classList.add('cached');
    this.sectionForm.nativeElement.classList.remove('displayed');
  }

  searchByKeywords(e:KeyboardEvent): void {
    if (e.code === 'Enter') {
      window.open(this.ztabUser.webSites[0].link + (e.target as HTMLInputElement).value);
    }
  }

  switchSectionForm(formType:number|null, index:number|null): void {
    console.log(this.sectionForm.nativeElement)
    if (formType === null) {
      this.sectionForm.nativeElement.classList.add('cached');
      this.sectionForm.nativeElement.classList.remove('displayed');
    } else {
      this.sectionForm.nativeElement.classList.remove('cached');
      this.sectionForm.nativeElement.classList.add('displayed');
    }
    this.formType = formType;
  }
}
