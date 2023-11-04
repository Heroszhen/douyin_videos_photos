import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { filter, map } from 'rxjs';
import { IData } from './interfaces/IData';
import { LeftnavComponent } from './components/common/leftnav/leftnav.component';
import { StoreService } from './services/store.service';
import { BeforeInstallPromptEvent } from 'src/app/interfaces/beforeInstallPromptEvent';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
import { AlertComponent } from './components/common/alert/alert.component';
import { wait } from './utils/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('leftNav') leftnav!: LeftnavComponent;
  isConnected?:boolean = null!;
  loading:Array<boolean|string> = [false, ""];
  deferredPrompt:BeforeInstallPromptEvent|null = null;
  displayLogin:boolean = false;
  user = {
    email:"",
    password:"",
    passwordType:""
  };
  @ViewChild('alert') alert:AlertComponent;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private storeService: StoreService,
    private swUpdate: SwUpdate
  ) { 
  }

  ngOnInit(): void {
    this.routerListener();
    this.storeService.connected$.subscribe((data:boolean[]) => {
      this.isConnected = data[0];
    });
    this.storeService.loading$.subscribe((data:Array<boolean|string>) => {
      this.loading = data;
      if (this.loading[1] === '')this.loading[1] = 'assets/photos/ad_loader.png';
    });

    this.apiService.checkToken(localStorage.getItem("token") ?? '');

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

  ngAfterViewInit() {
    this.updateApplication();
  }

  async updateApplication(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(async (evt) => {
          await wait(0.5);
          this.alert.showDialogue(1, "Une nouvelle version détectée, l'application va être redémarrée pour être mise à jour.");
          document.location.reload();
        });
    } else {
      await wait(0.5);
      this.alert.showDialogue(1, "Le service de la mise à jour automaique est désactivé, veuillez vider le cache manuellement pour mettre à jour l'application.");
    }
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
    });
  }

  checkToken(route:string):void {
    if (localStorage.getItem("token") === "" || localStorage.getItem("token") === null) { 
      this.storeService.connected$.next([false]);
      if (route !== "/" || !route.includes("/tailwindcss")) {
        this.router.navigate(["/"]);
      }
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

  showLoginForm(e:IData):void {
    this.user = {
      email:"",
      password:"",
      passwordType:"password"
    };
    this.displayLogin = true;
  }
  toLogin(target:EventTarget): void {
    const button:HTMLButtonElement|null = (target as HTMLFormElement).querySelector("button");
    const toggleButton = (disabled:boolean) => {
      if (button !== null)button.disabled = disabled;
    };
    toggleButton(true);
    this.apiService.postLoginToAD(this.user).subscribe({
      next: (data:IData)=>{
        if (data["status"] === 1) {
          localStorage.setItem('token', data['data']);
          this.storeService.connected$.next([true]);
          this.displayLogin = false;
        } 
        toggleButton(false);
      },
      error:(err)=>{
        console.log(err);
        toggleButton(false);
      }
    });
  }
}
