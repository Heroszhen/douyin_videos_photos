import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import env from '../../../assets/env.local.json';
import { wait, readFile, getImageFileFromUrl, capitalizeFirstLetter } from 'src/app/utils/util';
import { Indexeddb } from 'src/app/indexeddb/indexeddb';
import { ZTabCategory } from 'src/app/models/ZTabCategory';
import { ZTab } from 'src/app/models/ZTab';
import { ZTabUser } from 'src/app/models/ZTabUser';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-ztab',
  templateUrl: './ztab.component.html',
  styleUrls: ['./ztab.component.scss'],
  providers: [MessageService]
})
export class ZtabComponent implements OnInit, AfterViewInit {
  section:number = 1;
  indexedDB:Indexeddb = new Indexeddb();
  indexedDB_db:IDBDatabase;
  allCategorys: Array<ZTabCategory> = [];
  allTabs: Array<ZTab> = [];
  ztabUser: ZTabUser = new ZTabUser();
  categoryId:number|null = null;
  @ViewChild('ztabsection') ztabSection: ElementRef<HTMLElement>;
  elmIndex:number|null = null;
  //1:form-ztabUser-website-form, 
  formType:number|null = null;
  showListWebsites:boolean = false;
  @ViewChild('section_form') sectionForm: ElementRef<HTMLElement>;
  stateOptions: any[] = [{ label: 'Image Url', value: '1' },{ label: 'Upload Image', value: '2' }];
  stateValue: string = '2';
  photoUrl:string|null = null;
  ztabUserM:ZTabUser;
  webSiteM:Partial<ZTab>;
  categoryM: ZTabCategory;
  tabM: ZTab;
  reactiveForm: FormGroup|null = null;

  constructor(private messageService:MessageService) {
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

    this.indexedDB.get(this.indexedDB.ZTAB_USER, this.indexedDB_db).then(async (data:Array<object>) => {
      if (data[0])this.ztabUser = data[0] as ZTabUser;
      else {
        this.ztabUser.webSites = env['ztab']['user']['webSites'];
        let id:number = await this.indexedDB.add(this.indexedDB.ZTAB_USER, this.ztabUser)
        this.ztabUser = (await this.indexedDB.getById(this.indexedDB.ZTAB_USER, id, this.indexedDB_db)) as ZTabUser;
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
    if (this.sectionForm.nativeElement.classList.contains('displayed'))this.sectionForm.nativeElement.classList.add('cached');
    this.sectionForm.nativeElement.classList.remove('displayed');
  }

  searchByKeywords(e:KeyboardEvent): void {
    if (e.code === 'Enter') {
      window.open(this.ztabUser.webSites[0].link + (e.target as HTMLInputElement).value);
    }
  }

  switchSectionForm(formType:number|null, index:number|null): void {
    this.elmIndex = index;
    this.photoUrl = null;
    this.reactiveForm = null;

    switch(formType) {
      case 1:
        this.webSiteM = {
          title: null,
          link: null,
          logo: null
        }
        if (index !== null) {
          Object.assign(this.webSiteM, this.ztabUser.webSites[index]);
        }
        this.reactiveForm = new FormGroup({
          title: new FormControl(this.webSiteM["title"], [Validators.required, Validators.maxLength(10)]),
          link: new FormControl(this.webSiteM["link"], Validators.required),
          logo: new FormControl(this.webSiteM["logo"])
        });
        break;
      case 2:
        break;
      default:
        break;
    }

    if (formType === null) {
      this.sectionForm.nativeElement.classList.add('cached');
      this.sectionForm.nativeElement.classList.remove('displayed');
    } else {
      this.sectionForm.nativeElement.classList.remove('cached');
      this.sectionForm.nativeElement.classList.add('displayed');
    }
    this.formType = formType;
  }

  async handleFile(e:Event): Promise<void> {
    let file: File|undefined|null;
    if (e.type === 'change') {
      file = (e.target as HTMLInputElement).files?.item(0);
    } else {
      //focusout
      file = await getImageFileFromUrl((e.target as HTMLInputElement).value);
      console.log(file)
    }

    if (file instanceof File)this.photoUrl = (await readFile(file))['target']['result'];
  }

  async sendForm(): Promise<void> {
    console.log(this.reactiveForm)
    let id: number;
    switch(this.formType) {
      case 1:
        if (this.photoUrl !== null)this.reactiveForm?.patchValue({logo: this.photoUrl});
        if (this.elmIndex === null) {
          this.ztabUser.webSites.push(this.reactiveForm?.value);
        } else {
          this.ztabUser.webSites[this.elmIndex] = this.reactiveForm?.value;
        }
        id = await this.indexedDB.update(this.indexedDB.ZTAB_USER, this.ztabUser);
        this.ztabUser = (await this.indexedDB.getById(this.indexedDB.ZTAB_USER, id, this.indexedDB_db) as ZTabUser);
        this.displayToast('Enregistré');
        break;
      case 1:
        break;
      default:
        break;
    }
  }

  async deleteWebSite(index:number): Promise<void> {
    this.ztabUser.webSites.splice(index, 1);
    await this.indexedDB.update(this.indexedDB.ZTAB_USER, this.ztabUser, this.indexedDB_db);
    this.displayToast();
  }

  displayToast(message:string = 'Enregistré', severity:string = 'success'):void {
    this.messageService.add({ severity: severity, summary: capitalizeFirstLetter(severity), detail: message });
  }
}
