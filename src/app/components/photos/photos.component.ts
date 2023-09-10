import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { StoreService } from 'src/app/services/store.service';
import { Subscription } from 'rxjs';
import { IData, IPhoto } from 'src/app/interfaces/IData';
import { NgxMasonryOptions } from 'ngx-masonry';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss']
})
export class PhotosComponent implements OnInit, OnDestroy {
  subscribers: Subscription[] = [];
  window_width:number = window.innerWidth;

  canCharge:boolean = false;
  pageItem:number = 1;
  photos:IPhoto[] = [];
  public masonryOptions: NgxMasonryOptions = {
		resize: true,
		initLayout: true
	};
  elmindex:number|null = null;
  photoAction:number|null = null;
  magnizoom_imageStyle:any = "";
  photoZoomOut:number = 0;
  @ViewChild('photoToZoom') photoToZoom: ElementRef<HTMLImageElement>;
  angle:number = 0;

  constructor(private apiService: ApiService, private storeService: StoreService) { }

  ngOnInit(): void {
    let searchSubscriber:Subscription = this.storeService.toSearch$.subscribe((data:Array<boolean>) => {
      //this.toSearch = data[0];
    });
    this.subscribers.push(searchSubscriber);
    this.getPhotos();
    window.addEventListener('resize', this.listener.bind(this), true);
  }

  ngOnDestroy(): void {
    for (let entry of this.subscribers) entry.unsubscribe();
    window.removeEventListener('resize', this.listener.bind(this), true);
  }

  listener():void {
    this.window_width = window.innerWidth;
  }

  getPhotos(): void {
    this.canCharge = false;
    this.apiService.getGetPhotos(this.pageItem).subscribe({
      next: (data:IData)=>{
        if (data["status"] === 1) {
          if (data["data"] !== null && data["data"].length !== 0) {
            this.photos = this.photos.concat(data["data"]);
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

  listenToScroll(event: Event): void {
    let target:Element = (event.target as Element);
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
      if (this.canCharge) {
        this.getPhotos();
      }
    }
  }

  choosePhoto(index:number|null): void{
    this.photoAction = null;
    this.elmindex = index;
  }

  async setPhotoAction(action:number|null): Promise<void>{
    if (this.photoAction === action)this.photoAction = null;
    else {
      if (action === 2){
        this.photoZoomOut = 0;
      }
      if (action === 3){
        this.angle = 0;
      }
      this.photoAction = action;
    }
  }

  getActressName(index:number):string {
    if (this.photos[index]["name"] !== null) {
      return this.photos[index]["name"] ;
    } 
    
    let name:string|undefined = this.photos[index].actress?.name;
    return name  ?? "" ;
  }

  zoomPhoto(): void {
    if (this.photoZoomOut === 0){
      this.photoToZoom.nativeElement.style.width = `auto`;
    }
    this.photoZoomOut += 200;
    this.photoToZoom.nativeElement.style.height = `${this.photoZoomOut + this.photoToZoom.nativeElement.width}px`;
    console.log(this.photoToZoom.nativeElement.width)
  }

  rotatePhoto(): void {
    this.angle += 45;
    if (this.angle === 180)this.angle = 0;
    this.photoToZoom.nativeElement.style.transform = `rotate(${this.angle}deg)`;
  }
}
