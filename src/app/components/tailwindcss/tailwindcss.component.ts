import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-tailwindcss',
  templateUrl: './tailwindcss.component.html',
  styleUrls: ['./tailwindcss.component.scss']
})
export class TailwindcssComponent implements OnInit {
  token:string = "";
  constructor(
    private activedroute: ActivatedRoute, 
    private apiService: ApiService
  ) { 
    this.activedroute.params.subscribe((params)=>{
      if (params["token"] !== undefined) {
        this.token = params["token"];
        this.checkToken(params["token"])
      }
    });
  }

  ngOnInit(): void {
  }

  checkToken(token:string): void {
    this.apiService.checkToken(token);
  }

}
