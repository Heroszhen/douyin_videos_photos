import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  deferredPrompt:any = null;
  constructor() { }

  ngOnInit(): void {
    window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt.bind(this));
    window.addEventListener('appinstalled', this.onAppInstalled.bind(this));
  }

  switchHidden(): void{
    this.div.nativeElement.classList.toggle('displayed')
  }

  onBeforeInstallPrompt(event: BeforeInstallPromptEvent): void {
    console.log('🚀 onBeforeInstallPrompt');
    // Prevent the mini-info bar from appearing on mobile
    event?.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = event;
  }

  onAppInstalled(): void {
    console.log('🚀 onAppInstalled');
    this.deferredPrompt = null;
  }

  async installZooliclient(): Promise<void> {
    const promptEvent = this.deferredPrompt;
    console.log('install', this.deferredPrompt);
    if (!promptEvent) {
      return;
    }
    promptEvent.prompt();

    const result: boolean = await promptEvent.userChoice;
    console.log(result);
    if (result) {
      this.deferredPrompt = null;
    }
  }
}
