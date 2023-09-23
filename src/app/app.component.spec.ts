/// <reference types="jasmine" />
//ne classe Angular permettant principalement de créer un environnement de test émulant le fonctionnement d'un module Angular
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ApiService } from './services/api.service';
import { StoreService } from './services/store.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { TopnavComponent } from './components/common/topnav/topnav.component';
import { LeftnavComponent } from './components/common/leftnav/leftnav.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [
        AppComponent,
        TopnavComponent,
        LeftnavComponent
      ],
      providers: [
        {provide:ApiService},
        {provide:StoreService}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    //instancie le composant AppComponent de Angular
    const fixture = TestBed.createComponent(AppComponent);
    //l'instance de la classe
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should contain top nav', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const debugElement = fixture.debugElement;// objet permettant d'inspecter et de manipuler le DOM.
    expect(debugElement.nativeElement.querySelector('app-topnav')).toBeTruthy();
  });

  it('should contain left nav', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const debugElement = fixture.debugElement;
    expect(debugElement.nativeElement.querySelector('app-leftnav')).toBeTruthy();
  });

  it('should contain tag main', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const debugElement = fixture.debugElement;
    expect(debugElement.nativeElement.querySelector('main')).toBeTruthy();
  });

  it(`should not display section loading`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.loading[0]).toEqual(false);

    const debugElement = fixture.debugElement;
    expect(debugElement.nativeElement.querySelector('.wrap-loading')).toBeNull();
  });

  it(`should not display login form`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.displayLogin).toEqual(false);

    const debugElement = fixture.debugElement;
    expect(debugElement.nativeElement.querySelector('#section-login')).toBeNull();
  });

  it(`should not be connected`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const debugElement = fixture.debugElement;
    const storeService = debugElement.injector.get(StoreService);
    expect(storeService.connected$.getValue()[0]).toBeFalse();
  });

  it(`should can connected`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    
    // const debugElement = fixture.debugElement;
    // const apiService = debugElement.injector.get(ApiService);
    // const storeService = debugElement.injector.get(StoreService);
    // expect(storeService.connected$.getValue()[0]).toBeFalse();
  });

  // it('should render title', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.nativeElement as HTMLElement;
  //   expect(compiled.querySelector('.content span')?.textContent).toContain('joliesfilles app is running!');
  // });
});
