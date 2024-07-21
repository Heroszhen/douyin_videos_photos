import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import env from '../../../assets/env.local.json';
import { wait, readFile, getImageFileFromUrl, capitalizeFirstLetter, sortArray, clone } from 'src/app/utils/util';
import { Indexeddb } from 'src/app/indexeddb/indexeddb';
import { ZTabCategory } from 'src/app/models/ZTabCategory';
import { ZTab } from 'src/app/models/ZTab';
import { ZTabUser } from 'src/app/models/ZTabUser';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CdkDragDrop, CdkDragEnter, CdkDragMove, moveItemInArray } from "@angular/cdk/drag-drop";
import * as moment from 'moment';

@Component({
  selector: 'app-ztab',
  templateUrl: './ztab.component.html',
  styleUrls: ['./ztab.component.scss'],
  providers: [MessageService]
})
export class ZtabComponent implements OnInit, AfterViewInit, OnDestroy {
  section:number = 1;
  indexedDB:Indexeddb = new Indexeddb();
  indexedDB_db:IDBDatabase;
  allCategorys: Array<ZTabCategory> = [];
  allTabs: Array<ZTab> = [];
  ztabUser: ZTabUser = new ZTabUser();
  @ViewChild('ztabsection') ztabSection: ElementRef<HTMLElement>;
  elmIndex:number|null = null;
  //1:form-ztabUser-website-form, 
  formType:number|null = null;
  showListWebsites:boolean = false;
  @ViewChild('section_form') sectionForm: ElementRef<HTMLElement>;
  stateOptions: any[] = [{ label: 'Image Url', value: '1' },{ label: 'Upload Image', value: '2' }];
  stateValue: string = '2';
  photoUrl:string|null = null;
  userM:ZTabUser;
  webSiteM:Partial<ZTab>;
  categoryM: ZTabCategory;
  ztabM: ZTab;
  reactiveForm: FormGroup|null = null;
  @ViewChild('dropListContainerWebsite') dropListContainerWebsite?: ElementRef<HTMLElement>;
  @ViewChild('dropListContainerWeblink') dropListContainerWeblink?: ElementRef<HTMLElement>;
  dropListReceiverElement?: HTMLElement;
  dragDropInfo?: {
    dragIndex: Partial<ZTab>|ZTabCategory;
    dropIndex: Partial<ZTab>|ZTabCategory;
  };
  date = {
    time:'',
    date: ''
  };
  timer:number;
  rightMenu:boolean = false;
  rightMenuWidth:number = 196;
  rightMenuHeight:number = 245;
  rightMenuExtraAction:string|null = "";
  @ViewChild('rightmenudiv') rightMenuDiv: ElementRef<HTMLDivElement>;
  categoryId:number;
  private keyDownlistener:any;
  @ViewChild('wrapSlogan') wrapSlogan: ElementRef<HTMLDivElement>;
  sloganTimer:number;
  @ViewChild('dialog') dialog: ElementRef<HTMLDialogElement>;
  modalForm:number|null = null;
  form1 = {
    action: '1',//1: export, 2: import
    table:'',
    file: null
  }

  constructor(private messageService:MessageService) {
    this.getDB();
    this.keyDownlistener = (e:KeyboardEvent|Event) => {
      this.listenToKeydown(e);
    }
  }

  ngOnInit(): void {
    this.getTime();
    this.timer = window.setInterval(() => {
      this.getTime();
    }, 1000);
  }

  ngAfterViewInit(): void {
    window.addEventListener('keydown', this.keyDownlistener, false);
    window.addEventListener('resize', this.keyDownlistener, false);
  }

  ngOnDestroy(): void {
    window.clearInterval(this.timer);
    window.clearInterval(this.sloganTimer);
    window.removeEventListener('keydown', this.keyDownlistener, false);
    window.removeEventListener('resize', this.keyDownlistener, false);
  }

  getTime(): void {
    this.date.time = moment(new Date()).format('HH:mm:ss');
    this.date.date = moment(new Date()).format('MMMM Do YYYY');
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
      await this.ztabUserProvider();
      this.setBackgroundPhoto();
    });

    this.allCategorys = (await this.indexedDB.get(this.indexedDB.ZTAB_CATEGORY, this.indexedDB_db)) as Array<ZTabCategory>;
    if (this.allCategorys.length === 0) {
      this.categoryM = new ZTabCategory();
      this.categoryM.assignData(env['ztab']['category']);
      let id:number = await this.indexedDB.add(this.indexedDB.ZTAB_CATEGORY, this.categoryM)
      let category:ZTabCategory = (await this.indexedDB.getById(this.indexedDB.ZTAB_CATEGORY, id, this.indexedDB_db)) as ZTabCategory;
      this.allCategorys.push(category);
    }

    this.indexedDB.get(this.indexedDB.ZTAB_TAB, this.indexedDB_db).then(async (data:Array<object>) => {
      this.allTabs = data as Array<ZTab>;
      this.setCategoryId(this.allCategorys[0]['id']);
    });
  }

  setBackgroundPhoto(): void {
    let imageUrl:string = this.ztabUser.backgroundPhoto ?? 'assets/photos/ad_loader.png';
    this.ztabSection.nativeElement.style.background = `url(${imageUrl}) no-repeat`;
    this.ztabSection.nativeElement.style.backgroundSize = `cover`;
  }

  async setCategoryId(id:number|null|undefined): Promise<void> {
    if(id !== null && id !== undefined) {
      this.categoryId = id;
      this.allTabs = sortArray(this.allTabs, 'order', 1, 1);
    }
  }

  clickOnZtab(): void {
    this.showListWebsites = false;
    if (this.sectionForm.nativeElement.classList.contains('displayed'))this.sectionForm.nativeElement.classList.add('cached');
    this.sectionForm.nativeElement.classList.remove('displayed');
    this.rightMenu = false;
  }

  searchByKeywords(e:KeyboardEvent): void {
    if (e.code === 'Enter') {
      window.open(this.ztabUser.webSites[0].link + (e.target as HTMLInputElement).value);
    }
  }

  canDeleteCategory(index:number|null): boolean {
    if (this.allCategorys.length < 2 || index === null)return false;

    let id:number|undefined = this.allCategorys[index].id;
    for(let entry of this.allTabs) {
      if (entry.categoryId === id)return false;
    }

    return true;
  }

  async deleteCategory(index:number|null): Promise<void> {
    if (index !== null) {
      let id:number|undefined = this.allCategorys[index ?? -1].id;
      if (id !== undefined) {
        await this.indexedDB.remove(this.indexedDB.ZTAB_CATEGORY, id);
        this.allCategorys.splice(index, 1);
        this.displayToast('Deleted');
      }
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
          this.photoUrl = this.webSiteM.logo ?? null;
        }
        this.reactiveForm = new FormGroup({
          title: new FormControl(this.webSiteM["title"], [Validators.required, Validators.maxLength(10)]),
          link: new FormControl(this.webSiteM["link"], Validators.required),
          logo: new FormControl(this.webSiteM["logo"])
        });
        break;
      case 2:
        this.userM = new ZTabUser();
        this.userM.assignData(this.ztabUser);
        this.reactiveForm = new FormGroup({
          name: new FormControl(this.userM["name"]),
          slogan: new FormControl(this.userM["slogan"])
        });
        this.photoUrl = this.ztabUser.backgroundPhoto ?? 'assets/photos/ad_loader.png';
        break;
      case 3:
        this.reactiveForm = new FormGroup({
          title: new FormControl(index === null ? null : this.allCategorys[index].title, [Validators.required, Validators.maxLength(8)]),
          logo: new FormControl(index === null ? null : this.allCategorys[index].logo)
        });
        this.photoUrl = index === null ? null : this.allCategorys[index].logo; 
        break;
      case 4:
          this.ztabM = new ZTab();
          if (this.elmIndex !== null) {
            this.ztabM.assignData(this.allTabs[this.elmIndex]);
            this.photoUrl = this.ztabM.logo;
          }
          this.reactiveForm = new FormGroup({
            title: new FormControl(this.ztabM.title, [Validators.required, Validators.maxLength(20)]),
            logo: new FormControl(null),
            link: new FormControl(this.ztabM.link, [Validators.required]),
            categoryId: new FormControl(this.ztabM.categoryId, Validators.required),
          });
          for(let entry of this.allCategorys) {
            if (entry.id === this.ztabM.categoryId) {
              this.reactiveForm.patchValue({'categoryId': entry});
            }
          }
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
    }

    if (file instanceof File)this.photoUrl = (await readFile(file))['target']['result'];
  }

  async deleteWeblink(index:number|null): Promise<void> {
    if (index !== null) {
      let id:number = this.allTabs[index].id!;
      await this.indexedDB.remove(this.indexedDB.ZTAB_TAB, id, this.indexedDB_db);
      this.allTabs = this.allTabs.filter((tab:ZTab) => tab.id !== id);
      this.displayToast('Deleted');
    }
  }

  async sendForm(): Promise<void> {
    let id: number;
    switch(this.formType) {
      case 1:
        if (this.photoUrl !== null)this.reactiveForm?.patchValue({logo: this.photoUrl});
        if (this.elmIndex === null) {
          this.ztabUser.webSites.push(this.reactiveForm?.value);
        } else {
          this.ztabUser.webSites[this.elmIndex] = this.reactiveForm?.value;
        }
        id = await this.ztabUserProvider();
        this.ztabUser = (await this.indexedDB.getById(this.indexedDB.ZTAB_USER, id, this.indexedDB_db) as ZTabUser);
        this.setBackgroundPhoto();
        break;
      case 2:
        Object.assign(this.ztabUser, this.reactiveForm?.value);
        this.ztabUser.backgroundPhoto = this.photoUrl;
        id = await this.ztabUserProvider();
        this.ztabUser = (await this.indexedDB.getById(this.indexedDB.ZTAB_USER, id, this.indexedDB_db) as ZTabUser);
        this.setBackgroundPhoto();
        break;
      case 3:
        this.categoryM = new ZTabCategory();
        if (this.elmIndex !== null)this.categoryM.assignData(this.allCategorys[this.elmIndex]);
        this.categoryM.assignData(this.reactiveForm?.value);
        this.categoryM.logo = this.photoUrl;
        if (this.elmIndex === null) {
          id = await this.indexedDB.add(this.indexedDB.ZTAB_CATEGORY, this.categoryM, this.indexedDB_db);
          this.allCategorys.push((await this.indexedDB.getById(this.indexedDB.ZTAB_CATEGORY, id, this.indexedDB_db)) as ZTabCategory);
        } else {
          this.indexedDB.update(this.indexedDB.ZTAB_CATEGORY, this.categoryM, this.indexedDB_db);
          this.allCategorys[this.elmIndex] = clone(this.categoryM) as ZTabCategory;
        }
        break;
      case 4:
        this.ztabM.assignData(this.reactiveForm?.value);
        this.ztabM.categoryId = this.reactiveForm?.value.categoryId.id;
        this.ztabM.logo = this.photoUrl;
        if (this.elmIndex === null) {
          id = await this.indexedDB.add(this.indexedDB.ZTAB_TAB, this.ztabM, this.indexedDB_db);
          this.allTabs.push((await this.indexedDB.getById(this.indexedDB.ZTAB_TAB, id, this.indexedDB_db)) as ZTab);
        } else {
          await this.indexedDB.update(this.indexedDB.ZTAB_TAB, this.ztabM, this.indexedDB_db);
          this.allTabs[this.elmIndex] = this.ztabM;
        }
        this.setCategoryId(this.categoryId)
        break;
      default:
        break;
    }
    this.displayToast('Enregistré');
  }

  async deleteWebSite(index:number): Promise<void> {
    if (this.ztabUser.webSites.length < 2)return;

    this.ztabUser.webSites.splice(index, 1);
    await this.indexedDB.update(this.indexedDB.ZTAB_USER, this.ztabUser, this.indexedDB_db);
    this.displayToast();
  }

  displayToast(message:string = 'Enregistré', severity:string = 'success'):void {
    this.messageService.add({ severity: severity, summary: capitalizeFirstLetter(severity), detail: message });
  }

  
  async dragEnteredWebsite(event: CdkDragEnter<Partial<ZTab>>, obj:string = 'website'): Promise<void> {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    this.dragDropInfo = { dragIndex, dropIndex };

    const phContainer = dropList.element.nativeElement;
    const phElement = phContainer.querySelector('.cdk-drag-placeholder');

    if (phElement) {
      phContainer.removeChild(phElement);
      phContainer.parentElement?.insertBefore(phElement, phContainer);
      switch (obj) {
        case "website":
          this.allTabs.findIndex((entry:ZTab) => entry.id === dragIndex.id)
          moveItemInArray(
            this.ztabUser.webSites,
            this.ztabUser.webSites.findIndex((entry:Partial<ZTab>) => entry.order === dragIndex.order),
            this.ztabUser.webSites.findIndex((entry:Partial<ZTab>) => entry.order === dropIndex.order) 
          );
          break;
        case "weblink":
          this.allTabs.findIndex((entry:ZTab) => entry.id === dragIndex.id)
          moveItemInArray(
            this.allTabs, 
            this.allTabs.findIndex((entry:ZTab) => entry.id === dragIndex.id),
            this.allTabs.findIndex((entry:ZTab) => entry.id === dropIndex.id) 
          );
          break;
        default:
          break;
      }
      
    }    
  }

  dragMovedWebsite(event: CdkDragMove<Partial<ZTab>>, obj:string = 'website') {
    if ((!this.dropListContainerWebsite && !this.dropListContainerWeblink) || 
      !this.dragDropInfo) return;
    
      let placeholderElement:HTMLDivElement|undefined;
      switch (obj) {
        case "website":
          placeholderElement =
          this.dropListContainerWebsite?.nativeElement.querySelector(
            '.cdk-drag-placeholder'
          ) ?? undefined;
          break;
        case "weblink":
          placeholderElement =
          this.dropListContainerWeblink?.nativeElement.querySelector(
            '.cdk-drag-placeholder'
          ) ?? undefined;
          break;
        default:
          break;
    }
    const receiverElement =
      this.dragDropInfo.dragIndex.order ?? 0 > this.dragDropInfo.dropIndex.order! ?? 0
        ? placeholderElement?.nextElementSibling
        : placeholderElement?.previousElementSibling;
    if (!receiverElement) {
      return;
    }

    // // (receiverElement as HTMLElement).style.display = 'none';
    // this.dropListReceiverElement = (receiverElement as HTMLElement);
    //(receiverElement as HTMLElement).style.display = 'none';
    this.dropListReceiverElement = (receiverElement as HTMLElement);
  }

  async dragDroppedWebsite(event: CdkDragDrop<Partial<ZTab>>, obj:string = 'website'): Promise<void> {
    if (!this.dropListReceiverElement) {
      return;
    }

    switch (obj) {
      case "website":
        // moveItemInArray(this.ztabUser.webSites, this.dragDropInfo?.dragIndex.order ?? 0, this.dragDropInfo?.dropIndex.order ?? 0);
        //await this.ztabUserProvider();
        break;
      case "weblink":
        // moveItemInArray(this.allTabs, this.dragDropInfo?.dragIndex.order ?? 0, this.dragDropInfo?.dropIndex.order ?? 0);
        await this.ztabTabProvider();
        break;
      default:
        break;
    }
   

    this.dropListReceiverElement.style.removeProperty('display');
    this.dropListReceiverElement = undefined;
    this.dragDropInfo = undefined;
  }

  setOrder(tab:Array<Partial<ZTab>>): Array<Partial<ZTab>> {
    for(let index in tab) {
      tab[index]['order'] = parseInt(index);
    }

    return tab;
  }

  async ztabUserProvider(): Promise<number> {
    this.ztabUser.webSites = this.setOrder(this.ztabUser.webSites);
    let id:number = await this.indexedDB.update(this.indexedDB.ZTAB_USER, this.ztabUser, this.indexedDB_db);
    this.ztabUser.webSites = sortArray(this.ztabUser.webSites, 'order', 1, 1);
    return id;
  }

  async ztabCategopryProvider(): Promise<void> {
    this.allCategorys = this.setOrder(this.allCategorys) as ZTabCategory[];
    await this.indexedDB.update(this.indexedDB.ZTAB_CATEGORY, this.allCategorys, this.indexedDB_db);
    this.allCategorys = sortArray(this.allCategorys, 'order', 1, 1);
  }

  async ztabTabProvider(): Promise<void> {
    let order:number = 0;
    for(let index in this.allTabs) {
      if (this.allTabs[index].categoryId === this.categoryId) {
        this.allTabs[index].order = order;
        order++;
      }
    }
    this.allTabs.forEach(async (entry:ZTab) => this.indexedDB.update(this.indexedDB.ZTAB_TAB, entry, this.indexedDB_db))
  }


  //right menu

  async rightClick(event: MouseEvent, extraAction:string |null = '', index:number|null = null): Promise<void> {
    this.elmIndex = index;
    this.rightMenuExtraAction = extraAction;

    if (extraAction === null) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    await this.onRightClick(event);
  }

  async onRightClick(event: MouseEvent): Promise<void> {
    let e = event as PointerEvent;
    e.preventDefault();
    e.stopPropagation();
    
    let window_width: number = window.innerWidth;
    let window_height: number = window.innerHeight;
    let clientX:number = e.pageX;
    let clientY:number = e.pageY;
    if(clientX + this.rightMenuWidth >= window_width)this.rightMenuDiv.nativeElement.style.left = window_width - this.rightMenuWidth - 10 + 'px';
    else this.rightMenuDiv.nativeElement.style.left = clientX - 5 + 'px';
    if(clientY + this.rightMenuHeight >= window_height)this.rightMenuDiv.nativeElement.style.top = window_height - this.rightMenuHeight - 5 + 'px';
    else this.rightMenuDiv.nativeElement.style.top = clientY + 'px';

    this.rightMenu = true;
  }

  gotoPortfolio(): void {
    window.open("http://notes3wa.yangzhen.fr/portfolio", "_blank");
  }

  openFullScreen = (toOpen:boolean) => {
    const docElmWithBrowsersFullScreenFunctions = document.documentElement as HTMLElement & {
      mozRequestFullScreen(): Promise<void>;
      webkitRequestFullscreen(): Promise<void>;
      msRequestFullscreen(): Promise<void>;
      exitFullscreen(): Promise<void>;
      webkitExitFullscreen(): Promise<void>;
      msExitFullscreen(): Promise<void>;
      mozExitFullScreen(): Promise<void>;
    };

    if (toOpen) {
      if (docElmWithBrowsersFullScreenFunctions.requestFullscreen) {
        docElmWithBrowsersFullScreenFunctions.requestFullscreen();
      } else if (docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen) {
          /* Safari */
          docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  async listenToKeydown(e: KeyboardEvent|Event): Promise<void> {
    const getRandomInt = (max:number):number => Math.floor(Math.random() * max + 1);

    if (e instanceof KeyboardEvent) {
      if (this.section === 3) {
        e.preventDefault();
        e.stopPropagation();
        if (e.ctrlKey && e.key === 'z') {
          this.section = 1;
          this.openFullScreen(false);
          window.clearInterval(this.sloganTimer)
        }
      } else {
        if (e.ctrlKey && e.key === 'z') {
          this.section = 3;
          this.openFullScreen(true);
          
          await wait(0.4);
          let slogan:HTMLDivElement = this.wrapSlogan.nativeElement;
          let sloganSpeed = 50;
          let sloganLeft = slogan.clientWidth * -1;
          slogan.style.left = sloganLeft + "px";
          slogan.style.width = slogan.clientWidth + "px";
          this.sloganTimer = window.setInterval(() => {
            sloganLeft += sloganSpeed;
            slogan.style.left = sloganLeft + "px";
            if (sloganLeft > window.innerWidth + slogan.clientWidth) {
              let top = getRandomInt(window.innerHeight);
              slogan.style.top = top + "px";
              sloganLeft = slogan.clientWidth * -1;
              slogan.style.left = sloganLeft + "px";
            }
          }, 100);
        }
      }
    } else {
      if (document.fullscreenElement === null && this.section === 3) {
        this.openFullScreen(true);
      }
    }
  }

  toggleModal(toOpen:boolean = true, form:number|null = null) {
    this.modalForm = form;
    if (!toOpen) {
      this.dialog.nativeElement.close();
      return;
    }

    if (form === 1) {
      this.form1 = {
        action: '1',
        table : '',
        file : null
      }
    }

    this.dialog.nativeElement.showModal();
  }

  handleForm1File(event:Event) {
    console.log(event)
  }

  submitForm1() {
    if (this.form1.action === '1') {
      const convertTabToString = (tab:any[]) => {
        let str:string = "";
        let rowIndex:number = 0;
        let titlesTab:string [], dataTab: any[];
        for(let ob of tab) {
          titlesTab = [];
          dataTab = [];
          for(let index in ob) {
            if (rowIndex === 0) {
              titlesTab.push(index);
            }
            dataTab.push(ob[index]);
          }
          if (rowIndex === 0){
            str += titlesTab.join('|') + '\n';
          }
          str += dataTab.join('|') + '\n';
          rowIndex++;
        }

        return str;
      }
      
      let data:string = convertTabToString(this.form1.table === 'category' ? this.allCategorys : this.allTabs);
      const aTag = document.createElement('a');
      const blob = new Blob(['\uFEFF', data], {type: 'text/csv'});
      aTag.download = this.form1.table === 'category' ? 'categorys.csv' : 'websites.csv';
      aTag.href = URL.createObjectURL(blob);
      aTag.click();
      URL.revokeObjectURL(aTag.href);
      aTag.remove();
    }

    if (this.form1.action === '2') {
      
    }
  }
}
