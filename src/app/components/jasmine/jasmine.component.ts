import { Component, OnInit } from '@angular/core';
import { NgxMasonryOptions } from 'ngx-masonry';
import { IApiPlatform } from 'src/app/interfaces/IData';
import { ApiService } from 'src/app/services/api.service';
import env from '../../../assets/env.local.json';

@Component({
  selector: 'app-jasmine',
  templateUrl: './jasmine.component.html',
  styleUrls: ['./jasmine.component.scss']
})
export class JasmineComponent implements OnInit {
  allPhotos: {url:string}[] = [];
  allVideos: {url:string}[] = [];
  section:number = 2;
  photoIndex:number|null = null;
  public masonryOptions: NgxMasonryOptions = {
		resize: true,
		initLayout: true
	};
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {console.log(env['zhen'])
    this.getJasmine();
  }

  getJasmine(): void {
    let response:string|null = prompt("Who is zhen ?");
    if (response?.toLowerCase() === env['zhen']['response'].toLowerCase()) {
      this.apiService.getGetJasmine('photos').subscribe({
        next: (data:IApiPlatform & {'hydra:member':{url:string}[]})=>{
          this.allPhotos = data['hydra:member'];
        }
      });
      this.apiService.getGetJasmine('videos').subscribe({
        next: (data:IApiPlatform & {'hydra:member':{url:string}[]})=>{
          this.allVideos = data['hydra:member'];
        }
      });
    }
  }

  switchSection(): void {
    if (this.section === 1)this.section = 2;
    else {
      this.section = 1;
      document.querySelectorAll('video').forEach((video:HTMLElement) => (video as HTMLVideoElement).pause());
    }
  }

  wheelVideos(e:WheelEvent): void {
    if (this.section === 2) {
      let div = e.target as HTMLDivElement;
      let id:number = parseInt(div.id.split('-')[1]);
      this.stopVideo(document.getElementById(`video-${id}`));
      this.stopVideo(document.getElementById(`video-${id + 1}`));
      this.setVideosUrl(id);
    }
  }
  scrollVideos(e:Event): void {
    if (this.section === 2) {
      const video:HTMLVideoElement = document.getElementById('video-0') as HTMLVideoElement;
      let id:number = Math.floor((e.target as HTMLDivElement).scrollTop / video.clientHeight);
      this.stopVideo(document.getElementById(`video-${id - 1}`));
      this.stopVideo(document.getElementById(`video-${id + 1}`));
      this.setVideosUrl(id);
    }
  }

  private stopVideo = (video:HTMLElement|null): void => {
    (video as HTMLVideoElement)?.pause();
  }

  private setVideosUrl(index:number): void {
    const setSrc = (index:number): void => {
      let video: HTMLElement|null = document.getElementById(`video-${index}`);
      if (video !== null && [null, ''].includes(video.getAttribute('src')))video.setAttribute('src', this.allVideos[index]['url']);
    }

    setSrc(index - 1);
    setSrc(index);
    setSrc(index + 1);
  }
}
