import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IData } from 'src/app/interfaces/IData';
import { StoreService } from 'src/app/services/store.service';
import { wait } from 'src/app/utils/util';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent implements OnInit {
  keywords:string = "";
  @Output() toSendKeywords = new EventEmitter<IData>();
  @Input() propositions:Array<string> = [];
  elmindex:number = -1;
  pageItem:number = 1;
  action:number = -1;
  section:number|null =null;
  constructor(private storeService:StoreService) { }

  ngOnInit(): void {
  }

  closeSearchSection(): void{
    this.storeService.toSearch$.next([false]);
  }

  avoidUp(e:Event): void|boolean{
    e.stopPropagation();
    if((e as KeyboardEvent).keyCode === 38){
      //e.returnValue=false;

      return false;
    }
  }

  //action 1:search elment keywords 2:get by keywords, 3:get  by proposition
  sendKeywords(e:Event|null, action:number = 1, keywords:string|null = null): void{
    if (e !== null) {
      let keyCode:number = (e as KeyboardEvent).keyCode;
      if ([13, 38, 40].includes(keyCode)){
        e.stopPropagation();
        this.changeElmindex(keyCode);
  
        return;
      }
    }

    this.toSendKeywords.emit({status:1, data:{action:action, keywords: keywords === null ? this.keywords : keywords}});
    this.elmindex = -1;
    this.pageItem = 1;
    this.propositions = [];
  }

  changeElmindex(keyCode:number): void{
    //38 up,40 down, 13 entrée
    if (this.propositions.length > 0) {
      if (keyCode === 13){
        if (this.elmindex === -1)this.sendKeywords(null, 2);
        else this.sendKeywords(null, 3, this.propositions[this.elmindex]);
      } else {
        if (this.elmindex === -1)this.elmindex = 0;
        else if (keyCode === 38) {
          if (this.elmindex <= 1)this.elmindex = 0;
          else this.elmindex--;
        } else if (keyCode === 40) {
          if (this.elmindex >= this.propositions.length - 2)this.elmindex = this.propositions.length - 1;
          else this.elmindex++;
        }
      }
    } else {
      this.sendKeywords(null, 2);
    }
  }

  async switchSection(s:number|null){
    this.section = s;
    await wait(1);
  }
}
