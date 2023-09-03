import { Component, OnInit } from '@angular/core';
import { IData, IVideo } from 'src/app/interfaces/IData';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-douyin',
  templateUrl: './douyin.component.html',
  styleUrls: ['./douyin.component.scss']
})
export class DouyinComponent implements OnInit {

  videos:IVideo[] = [];
  pageItem:number = 1;
  canCharge:boolean = false;
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getVideos();
  }

  getVideos(): void {
    this.canCharge = false;
    this.apiService.getGetDouyinVideos(this.pageItem).subscribe({
      next: (data:IData)=>{
        if (data["status"] === 1) {
          this.videos = this.videos.concat(data["data"]);
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

  listenToScroll(eventTarget:EventTarget|null): void {
    let target:Element = (eventTarget as Element);
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
      if (this.canCharge) {
        this.getVideos();
      }
    }
  }

  openOriginalSite(index:number): void {
    window.open(this.videos[index]["videourl"], "_blank");
  }

}
