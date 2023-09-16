import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { IActress, IData } from 'src/app/interfaces/IData';
import { CarouselComponent } from 'ngx-acuw';

interface IActressPhotos {
    birthday:string,
    country:string,
    description:string,
    mkphotos:Array<{
      photourl:string
    }>
}

@Component({
  selector: 'app-actresses',
  templateUrl: './actresses.component.html',
  styleUrls: ['./actresses.component.scss']
})
export class ActressesComponent implements OnInit {

  actresses: Array<IActress> = [];
  autoPlay:boolean = true;
  displayCarousel:boolean = false;
  options = {
    autoPlay: true,
    cameraDistance: 330,
    activeCarouselItem:0
  }
  @ViewChild('carousel') carousel:CarouselComponent;
  @ViewChild('actress_description') actressDescription: ElementRef<HTMLDivElement>;
  elmindex:number = -1;
  actressPhotos:IActressPhotos|null = null;
  actressPhotoIndex:number = -1;
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getActresses();
  }

  getActresses(): void {
    this.apiService.getGetActresses().subscribe({
      next: (data:IData)=>{
        if (data["status"] === 1) {
          if (data["data"] !== null && data["data"].length !== 0) {
            this.actresses = data["data"];
            this.displayCarousel = true;
          }
        }
      },
      error:(err)=>{
        console.log(err);
      }
    });
  }

  getActressDescription(): void {
    this.elmindex = this.carousel.activeCarouselElement;
    let id:number = this.actresses[this.carousel.activeCarouselElement]["id"];
    this.getActressPhotos(id);
    this.actressPhotos = null;
    this.actressPhotoIndex = -1;
    this.toggleActressDescription();
  }

  toggleActressDescription(): void{
    if (!this.actressDescription.nativeElement.classList.contains('displayed')) {
      this.actressDescription.nativeElement.classList.add('displayed')
    } else {
      this.actressDescription.nativeElement.classList.toggle('closed');
    }
  }

  getActressPhotos(id:number): void {
    this.apiService.getGetActressPhotos(id).subscribe({
      next: (data:IData)=>{
        if (data["status"] === 1) {
          this.actressPhotos = data["data"];
        }
      },
      error:(err)=>{
        console.log(err);
      }
    });
  }

  showBigPhoto(index:number):void {
    this.actressPhotoIndex = index;
  }
}
