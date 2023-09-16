import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { IActress, IData } from 'src/app/interfaces/IData';
import { wait } from 'src/app/utils/util';

@Component({
  selector: 'app-actresses',
  templateUrl: './actresses.component.html',
  styleUrls: ['./actresses.component.scss']
})
export class ActressesComponent implements OnInit {

  actresses: Array<IActress> = [];
  autoPlay:boolean = true;
  displayCarousel:boolean = false;
  @ViewChild('carousel') carousel: ElementRef;
  options = {
    autoPlay: true,
    cameraDistance: 300
  }
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getActresses();
  }

  getActresses(): void {
    this.apiService.getGetActresses().subscribe({
      next: (data:IData)=>{
        if (data["status"] === 1) {
          if (data["data"] !== null && data["data"].length !== 0) {
            this.actresses = data["data"];console.log(this.actresses)
            this.displayCarousel = true;
          }
        }
      },
      error:(err)=>{
        console.log(err);
      }
    });
  }
}
