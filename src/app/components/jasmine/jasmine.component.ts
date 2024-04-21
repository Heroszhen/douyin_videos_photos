import { Component, OnInit } from '@angular/core';
import { NgxMasonryOptions } from 'ngx-masonry';
import { IApiPlatform } from 'src/app/interfaces/IData';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-jasmine',
  templateUrl: './jasmine.component.html',
  styleUrls: ['./jasmine.component.scss']
})
export class JasmineComponent implements OnInit {
  allPhotos: {url:string}[] = [];
  allVideos: {url:string}[] = [];
  section:number = 2;
  public masonryOptions: NgxMasonryOptions = {
		resize: true,
		initLayout: true
	};
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getJasmine();
  }

  getJasmine(): void {
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

  switchSection(): void {
    if (this.section === 1)this.section = 2;
    else this.section = 1;
  }
}
