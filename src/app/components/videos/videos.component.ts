import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { StoreService } from 'src/app/services/store.service';
import { Subscription } from 'rxjs';
import { IData } from 'src/app/interfaces/IData';
import { IVideoPlayerParams, videoType } from 'src/app/interfaces/ivideoPlayerParams';
import { wait, removeTags } from 'src/app/utils/util';

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
  wheelTimer:number = null!;
  @ViewChild('wrap_description') wrapDescription!:ElementRef<HTMLDivElement>;
  toSearch:boolean = false;
  videoPlayerParams:IVideoPlayerParams = null!;

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
  }

  ngOnInit(): void {
    let connectedSubscriber = this.storeService.connected$.subscribe((data:Array<boolean>) => {
      if (data[0] !== undefined && data[0]) {
        this.canCharge = true;
        this.getVideos();
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
        window.clearTimeout(this.wheelTimer);
        this.wheelTimer = null!;
      }, 1000);
      if (event.deltaY < 0) {//up
        this.changeElmindex(2);
      } else if (event.deltaY > 0){//down
        this.changeElmindex(1);
      } 
    }
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
      this.wrapDescription.nativeElement.classList.contains("displayed")
      )return;

    if (action === 1) {
      if (this.elmindex < this.videos.length - 1){
        this.elmindex++;
        this.setVideoPlayerParams();
      }
      if (this.elmindex === this.videos.length - 3)this.getVideos();
    }
    if (action === 2) {
      if (this.elmindex > 0){
        this.elmindex--;
        this.setVideoPlayerParams();
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
    this.wrapDescription.nativeElement.classList.toggle("displayed");
  }


  getKeywords(e:IData): void{
    this.canCharge2 = true;
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
          if (data["status"] === 1) {
            if (data["data"] !== null && data["data"].length != 0) {
              this.foundVideos = this.foundVideos.concat(data["data"]);
              this.keywordsPageItem++;
            }
          }
        },
        error:(err)=>{
          console.log(err);
        }
      });console.log(this.keywordsKeywords)
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
