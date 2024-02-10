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
  hiddenMask:boolean = true;
  @ViewChild('ref_image') ref_image: ElementRef<HTMLImageElement>;
  @ViewChild('ref_bigimage') ref_bigimage: ElementRef<HTMLImageElement>;
  @ViewChild('ref_wrapbigimage') ref_wrapbigimage: ElementRef<HTMLDivElement>;
  @ViewChild('ref_mask') ref_mask: ElementRef<HTMLDivElement>;
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
    if (this.window_width <= 767) {
      if (this.photoAction === 5) {
        this.photoAction = null;
      }
    }
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
    return name ?? "" ;
  }

  zoomPhoto(): void {
    if (this.photoZoomOut === 0){
      this.photoToZoom.nativeElement.style.width = `auto`;
    }
    this.photoZoomOut += 200;
    this.photoToZoom.nativeElement.style.height = `${this.photoZoomOut + this.photoToZoom.nativeElement.width}px`;
  }

  rotatePhoto(): void {
    this.angle += 45;
    if (this.angle === 180)this.angle = 0;
    this.photoToZoom.nativeElement.style.transform = `rotate(${this.angle}deg)`;
  }

  switchMask(action:number): void {
    if (action == 1) {
      //hover
      this.hiddenMask = false;
    } else {
        //leave
        this.hiddenMask = true;
    }
  }

  moveMask(e:MouseEvent) {
    let clientRect:DOMRect = this.ref_image.nativeElement.getBoundingClientRect();
    let top:number = Math.ceil(clientRect.top); //y->vertical
    let left:number = Math.ceil(clientRect.left); //x -> horizontal
    let width_image:number = this.ref_image.nativeElement.clientWidth;
    let height_image:number = this.ref_image.nativeElement.clientHeight;
    if (
        e.clientY < top ||
        e.clientY > top + height_image ||
        e.clientX < left ||
        e.clientX > left + width_image
    ) {
        this.hiddenMask = true;
        return;
    }
    //let bigimageurl:string|null = this.ref_image.nativeElement.getAttribute("src");
    this.hiddenMask = false;
    let top2 = e.clientY - top - 50;
    if (top2 < 0) top2 = 0;
    if (e.clientY + 50 > top + height_image) top2 = height_image - 100;
    let left2 = e.clientX - left - 50;
    if (left2 < 0) left2 = 0;
    if (e.clientX + 50 > left + width_image) left2 = width_image - 100;
    this.ref_mask.nativeElement.style.top = top2 + "px";
    this.ref_mask.nativeElement.style.left = left2 + "px";
    let per_width = (e.clientX - left) / width_image;
    let per_height = (e.clientY - top) / height_image;

    //big image
    let half_wrap_width:number = this.ref_wrapbigimage.nativeElement.clientWidth / 2;
    let half_wrap_height:number = this.ref_wrapbigimage.nativeElement.clientHeight / 2;
    let bigwidth:number = per_width * this.ref_bigimage.nativeElement.clientWidth;
    let bigheight:number = per_height * this.ref_bigimage.nativeElement.clientHeight;
    this.ref_bigimage.nativeElement.style.marginLeft = half_wrap_width - bigwidth + "px";
    this.ref_bigimage.nativeElement.style.marginTop = half_wrap_height - bigheight + "px";
}
}
