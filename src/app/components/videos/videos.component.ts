import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { StoreService } from 'src/app/services/store.service';
import { Subscription } from 'rxjs';
import { IData, CacheType } from 'src/app/interfaces/IData';
import { IVideoPlayerParams, videoType } from 'src/app/interfaces/ivideoPlayerParams';
import { wait, removeTags } from 'src/app/utils/util';
import { Indexeddb } from 'src/app/indexeddb/indexeddb';
import { IndexeddbCache } from 'src/app/models/IndexeddbCache';

interface IVideo {
  actressname:string,
  created:string,
  description?:string
  id:number,
  last:number,
  name:string,
  phototype:number,
  photourl:string,
  siteurl:string,
  videotype:number,
  videourl:string
}

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit, OnDestroy, AfterViewInit {
  subscribers: Subscription[] = [];
  windowWidth: number = 768;
  pageItem:number = 1;
  canCharge:boolean = false;
  videos:Array<IVideo> = [];
  elmindex:number = -1;
  wheelTimer:number|null = null;
  @ViewChild('wrap_description') wrapDescription!:ElementRef<HTMLDivElement>;
  toSearch:boolean = false;
  videoPlayerParams:IVideoPlayerParams|null = null;
  indexedDB:Indexeddb;
  indexedDB_db:IDBDatabase;
  indexedDB_videoId:number;

  foundVideos:Array<IVideo> = [];
  propositions:Array<string> = [];
  keywordsAction:number = null!;
  keywordsKeywords:string = "";
  keywordsName:string = "";
  keywordsActressname:string = "";
  keywordsPageItem:number = 1;
  canCharge2:boolean = true;
  constructor(private apiService: ApiService, private storeService: StoreService) { 
    this.windowWidth = window.innerWidth;
    this.indexedDB = new Indexeddb();
  }

  async ngOnInit(): Promise<void> {
    let connectedSubscriber = this.storeService.connected$.subscribe(async (data:Array<boolean>) => {
      if (data[0] !== undefined && data[0]) {
        this.canCharge = true;
        if (!await this.getCache())this.getVideos();
      }
    });
    let searchSubscriber = this.storeService.toSearch$.subscribe((data:Array<boolean>) => {
      this.toSearch = data[0];
      this.foundVideos = [];
      this.propositions = [];
      this.canCharge2 = true;
      this.keywordsAction = null!
    });
    this.subscribers.push(connectedSubscriber, searchSubscriber);
    window.addEventListener('resize', this.listener.bind(this), true);
  }

  ngOnDestroy(): void {
    for (let entry of this.subscribers) entry.unsubscribe();
    window.removeEventListener('resize', this.listener.bind(this), true);
    window.removeEventListener("wheel", this.wheelListener.bind(this), true)
  }

  ngAfterViewInit(): void {
    window.addEventListener("wheel", this.wheelListener.bind(this), true)
  }

  listener(): void {
    this.windowWidth = window.innerWidth;
  }

  wheelListener(event:WheelEvent): void {
    if (this.wheelTimer === null) {
      this.wheelTimer = window.setTimeout(() => {
        if(this.wheelTimer !== null)window.clearTimeout(this.wheelTimer);
        this.wheelTimer = null!;
      }, 1000);
      if (event.deltaY < 0) {//up
        this.changeElmindex(2);
      } else if (event.deltaY > 0){//down
        this.changeElmindex(1);
      } 
    }
  }

  async getIndexeddb(): Promise<void> {
    console.log(Indexeddb);
  }

  getVideos(): void {
    if (this.canCharge) {
      this.canCharge = false;
      this.apiService.getGetVideos(this.pageItem).subscribe({
        next: (data:IData)=>{
          if (data["status"] === 1) {
            this.videos = this.videos.concat(data["data"]);
            if (this.elmindex === -1){
              this.elmindex = 0;
              this.setVideoPlayerParams();
            }
            if (data["data"].length > 0) {
              this.pageItem++;
              this.canCharge = true;
              this.setCache();
            }
          }
        },
        error:(err)=>{
          console.log(err);
        }
      });
    }
  }

  //action: 1=>down, 2:up
  changeElmindex(action:number): void {
    if(this.toSearch || 
      (this.wrapDescription.nativeElement.classList.contains("displayed") &&
        !this.wrapDescription.nativeElement.classList.contains("cached")
      )
    )return;

    if (action === 1) {
      if (this.elmindex < this.videos.length - 1){
        this.elmindex++;
        this.setVideoPlayerParams();
        this.setElmindexInCache();
      }
      if (this.elmindex === this.videos.length - 3)this.getVideos();
    }
    if (action === 2) {
      if (this.elmindex > 0){
        this.elmindex--;
        this.setVideoPlayerParams();
        this.setElmindexInCache();
      }
    }
  }

  async setVideoPlayerParams(): Promise<void>  {
    this.videoPlayerParams = null!;
    await wait(0.1);
    this.videoPlayerParams = this.setVideoPlayerParamsByType(this.videos[this.elmindex]);
  }

  setVideoPlayerParamsByType(video:IVideo, classname:string = ""): IVideoPlayerParams {
    let type:videoType = null!;
    switch (video["videotype"]) {
      case 1:
        type = videoType.Html;
        break;
      case 2:
        type = videoType.Video;
        break;
      case 4:
        type = videoType.TickTok;
        break;
      case 5:
        type = videoType.Iframe;
    }

    return {
      video:video["videourl"],
      type: type,
      className: classname,
    }
  }

  switchDescription(): void{
    if (!this.wrapDescription.nativeElement.classList.contains("displayed"))this.wrapDescription.nativeElement.classList.toggle("displayed");
    else this.wrapDescription.nativeElement.classList.toggle("cached");
  }

  async setCache(): Promise<void> {
    let cache = new IndexeddbCache();
    cache.assignData({
      content: this.videos,
      type:CacheType.Video,
      pageItem:this.pageItem,
      elmindex:this.elmindex,
      id: this.indexedDB_videoId
    });
    await this.indexedDB.update("video", cache, this.indexedDB_db);
  }

  async getCache(): Promise<boolean> {
    this.indexedDB_db = await this.indexedDB.opendDB();
    await wait(0.1);
    let tab:object[] = await this.indexedDB.get("video", this.indexedDB_db);
    if (tab.length === 0) {//first time
      this.indexedDB_videoId = await this.indexedDB.add("video", new IndexeddbCache(), this.indexedDB_db);
    } else {
      let cache:IndexeddbCache = tab[0] as IndexeddbCache;
      this.indexedDB_videoId = cache.id as number;
      this.videos = cache["content"];
      this.pageItem = cache.pageItem;
      if (this.videos.length > 0) {
        this.elmindex = cache.elmindex;
        this.canCharge = true;
        this.setVideoPlayerParams();
      }

      return true;
    }
    
    return false;
  }

  async setElmindexInCache(): Promise<void> {
    let cache:object =  await this.indexedDB.getById("video", this.indexedDB_videoId, this.indexedDB_db);
    (cache as IndexeddbCache).elmindex = this.elmindex;
    this.indexedDB.update("video", cache, this.indexedDB_db);
  }



  getKeywords(e:IData): void{
    if (e.data.keywords === '')return;
    this.canCharge2 = false;
    this.keywordsAction = e.data.action;
    let keywords:string = removeTags(e.data.keywords);
    if (e.data.action === 1) { 
      if (keywords.length >= 2) {
        this.apiService.getSearchVideosByKeywords(keywords).subscribe({
          next: (data:IData)=>{
            if (data["status"] === 1) {
              let pattern = new RegExp(keywords,"ig");
              let result:Array<string> = [];
              for (let index in data["data"]) {
                result = data["data"][index].match(pattern);
                for (let retrieve of result) {
                  data["data"][index] = data["data"][index].replaceAll(retrieve, `<span class='font-bold text-red-600'>${retrieve}</span>`)
                }
              }
              this.propositions = data["data"];
            }
          },
          error:(err)=>{
            console.log(err);
          }
        })
      }
    }
   
    if ([2, 3].includes(e.data.action)) {
      this.keywordsPageItem = 1;
      this.foundVideos = [];
      if (e.data.action === 2) {
        this.keywordsKeywords = keywords;
      }

      if (e.data.action === 3) {
        let tab:Array<string> = keywords.split(":");
        this.keywordsName = tab[1].trim();
        this.keywordsActressname = tab[0].trim();
      }

      this.apiService.getGetVideosByKeywords(this.keywordsAction, this.keywordsKeywords, this.keywordsName, this.keywordsActressname, this.keywordsPageItem).subscribe({
        next: (data:IData)=>{
          if (data["status"] === 1) {console.log(this.foundVideos)
            if (data["data"] !== null && data["data"].length != 0) {
              this.foundVideos = data["data"];
              this.keywordsPageItem++;
            }
          }
          this.canCharge2 = true;
        },
        error:(err)=>{
          console.log(err);
          this.canCharge2 = true;
        }
      });
    }
  }

  ListenToSectionFroundVideosScroll(e:Event): void{
    let target:Element = (e.target as Element);
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
      if (this.canCharge2) {
        this.canCharge2 = false;
        this.apiService.getGetVideosByKeywords(this.keywordsAction, this.keywordsKeywords, this.keywordsName, this.keywordsActressname, this.keywordsPageItem).subscribe({
          next: (data:IData)=>{
            if (data["status"] === 1) {
              if (data["data"] !== null && data["data"].length != 0) {
                this.foundVideos = this.foundVideos.concat(data["data"]);
                this.canCharge2 = true;
                this.keywordsPageItem++;
              }
            }
          },
          error:(err)=>{
            this.canCharge2 = true;
            console.log(err);
          }
        });
      }
    }
    
  }



  touchStart(e:Event): void {

  }

  touchMove(e:Event): void {
    console.log(e)
  }

  touchEnd(e:Event): void {

  }

}
