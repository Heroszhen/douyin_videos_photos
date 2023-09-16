import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { IActress, IData } from 'src/app/interfaces/IData';

@Component({
  selector: 'app-actresses',
  templateUrl: './actresses.component.html',
  styleUrls: ['./actresses.component.scss']
})
export class ActressesComponent implements OnInit {

  actresses: Array<IActress> = [];
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.getActresses();
  }

  getActresses():void {
    this.apiService.getGetActresses().subscribe({
      next: (data:IData)=>{
        if (data["status"] === 1) {
          if (data["data"] !== null && data["data"].length !== 0) {
            this.actresses = data["data"];console.log(this.actresses)
          }
        }
      },
      error:(err)=>{
        console.log(err);
      }
    });
  }
}
