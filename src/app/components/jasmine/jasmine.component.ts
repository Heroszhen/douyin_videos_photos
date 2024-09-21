import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { NgxMasonryOptions } from 'ngx-masonry';
import { IApiPlatform } from 'src/app/interfaces/IData';
import { ApiService } from 'src/app/services/api.service';
import env from '../../../assets/env.local.json';

interface IVideo {
  updated:string,
  url:string,
  name:string
}

@Component({
  selector: 'app-jasmine',
  templateUrl: './jasmine.component.html',
  styleUrls: ['./jasmine.component.scss']
})
export class JasmineComponent implements OnInit {
  allPhotos: IVideo[] = [];
  allVideos: IVideo[] = [];
  section:number = 2;
  photoIndex:number|null = null;
  public masonryOptions: NgxMasonryOptions = {
		resize: true,
		initLayout: true
	};
  @ViewChildren('jasminvideo') jasmineVideos:QueryList<ElementRef<HTMLVideoElement>>;
  videoCounter:number = 15;
  activedBtnSection: boolean = false;
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getJasmine();
  }

  getJasmine(): void {
    // let response:string|null = prompt("Who is zhen ?");
    // if (response?.toLowerCase().trim() === env['zhen']['response'].toLowerCase().trim()) {
      this.apiService.getGetJasmine('photos').subscribe({
        next: (data:IApiPlatform & {'hydra:member':{url:string}[]})=>{
          this.allPhotos = data['hydra:member'];
        }
      });
      this.apiService.getGetJasmine('videos').subscribe({
        next: (data:IApiPlatform & {'hydra:member':{url:string}[]})=>{
          this.allVideos = data['hydra:member'];
          this.allVideos.sort((a: IVideo, b: IVideo) => {
            return new Date(b["updated"]).getTime() - new Date(a["updated"]).getTime();
          });
        }
      });
    // }
  }

  switchSection(s:number): void {
    if (this.section === 2 && s !== 2) {
      this.section = 1;
      document.querySelectorAll('video').forEach((video:HTMLElement) => (video as HTMLVideoElement).pause());
    }
    this.section = s;
  }

  wheelVideos(e:WheelEvent): void {
    if (this.section === 2) {
      let div = e.target as HTMLDivElement;
      let id:number = parseInt(div.id.split('-')[1]);
      this.stopVideos(id);
      this.setVideosUrl(id);
    }
  }

  scrollVideos(e:Event): void {
    if (this.section === 2) {
      const video:HTMLVideoElement = document.getElementById('video-0') as HTMLVideoElement;
      let id:number = Math.floor((e.target as HTMLDivElement).scrollTop / video.clientHeight);
      this.stopVideos(id);
      this.setVideosUrl(id);
    }
  }

  private stopVideos(index:number): void {
    for(let i = index - this.videoCounter; i <= index; i++) {
      this.jasmineVideos.get(i)?.nativeElement.pause();
    }
    for(let i = index + this.videoCounter; i > index; i--) {
      this.jasmineVideos.get(i)?.nativeElement.pause();
    }
  }

  private setVideosUrl(index:number): void {
    const setSrc = (index:number): void => {
      let video: HTMLVideoElement|undefined = this.jasmineVideos.get(index)?.nativeElement;
      if (video !== undefined && [null, ''].includes(video.getAttribute('src')))video.setAttribute('src', this.allVideos[index]['url']);
    }

    for(let i = index - this.videoCounter; i <= index; i++) {
      setSrc(i);
    }
    for(let i = index + this.videoCounter; i > index; i--) {
      setSrc(i);
    }
  }
}
