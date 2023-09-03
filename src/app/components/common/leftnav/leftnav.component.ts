import { Component, ElementRef, EventEmitter, Output, OnInit, ViewChild } from '@angular/core';
import { IData } from 'src/app/interfaces/IData';
import { BeforeInstallPromptEvent } from 'src/app/interfaces/beforeInstallPromptEvent';
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.scss']
})
export class LeftnavComponent implements OnInit {

  @ViewChild('div_leftnav') div!:ElementRef<HTMLDivElement>;
  @Output() installApp = new EventEmitter<IData>();
  constructor() { }

  ngOnInit(): void {
  }

  switchHidden(): void{
    this.div.nativeElement.classList.toggle('displayed')
  }

  installZooliclient(): void {
    this.installApp.emit({status:1, data:""});
  }
}
