import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { filter, map } from 'rxjs';
import { IData } from './interfaces/IData';
import { LeftnavComponent } from './components/common/leftnav/leftnav.component';
import { StoreService } from './services/store.service';
import { BeforeInstallPromptEvent } from 'src/app/interfaces/beforeInstallPromptEvent';
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('leftNav') leftnav!: LeftnavComponent;
  isConnected?:boolean = null!;
  loading:Array<boolean|string> = [false, ""];
  deferredPrompt:BeforeInstallPromptEvent|null = null;
  constructor(
    private router: Router,
    private apiService: ApiService,
    private storeService: StoreService
  ) { 
  }

  ngOnInit(): void {
    this.routerListener();
    this.storeService.connected$.subscribe((data:boolean[]) => {
      this.isConnected = data[0];
    })
    this.storeService.loading$.subscribe((data:Array<boolean|string>) => {
      this.loading = data;
      if (this.loading[1] === '')this.loading[1] = 'assets/photos/ad_loader.png';
    })

    window.addEventListener('beforeinstallprompt', (event: BeforeInstallPromptEvent) => {
      console.log('🚀 onBeforeInstallPrompt');
      event?.preventDefault();
      this.deferredPrompt = event;
    });
    window.addEventListener('appinstalled', () => {
      console.log('🚀 onAppInstalled');
      this.deferredPrompt = null;
    });
  }

 

  routerListener(): void {
    this.router.events.pipe(
      filter((event:any): event is NavigationEnd => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url))
      .subscribe({
        next: (data:string)=>{
          this.checkToken(data);
          this.storeService.toSearch$.next([false]);
        },
        error:(err:any) =>{}
    })
  }

  checkToken(route:string):void {
    if (route === "/" || !route.includes("/tailwindcss")) {
      this.apiService.checkToken(localStorage.getItem("token") ?? '');
    }
  }

  switchLeftNav(event:IData): void {
    if(event["status"] === 1)this.leftnav.switchHidden();
  }

  async installApp(e:IData): Promise<void> {
    console.log('install', this.deferredPrompt);
    if (!this.deferredPrompt) {
      return;
    }
    this.deferredPrompt.prompt();
    const {outcome: outcome, platform:platform} = await this.deferredPrompt.userChoice;
    if (outcome === "accepted") {
      this.deferredPrompt = null;
    }
  }
}
