import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  response:boolean|null = null;
  type:number|null = null;//1-alert, 2-confirm
  sentence:string = "";
  host:string = "";
  constructor() { 
    this.host = window.location.host;
  }

  ngOnInit(): void {
  }

  showDialogue(type:number, sentence:string):void {
    this.type = type;
    this.sentence = sentence;
  }

  reply(response:boolean):void {
    this.type = null
    this.response = response;
  }

  getResponse(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let interval:number = window.setInterval(() => {
        if (this.response !== null) {
          window.clearInterval(interval);
          resolve(this.response);
        }
      }, 500);
  });
  }
}
