import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ApiService } from 'src/app/services/api.service';

interface IQueryParams {
  token:string
}

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
    this.activedroute.queryParams.subscribe((params:any) => {
      if (params["token"] !== undefined) {
        localStorage.setItem('token', params["token"])
      }
    });

    this.activedroute.params.subscribe((params)=>{
      if (params["token"] !== undefined) {
        this.token = params["token"];
        //this.apiService.checkToken(this.token);
      }
    });
  }

  ngOnInit(): void {
  }
}
