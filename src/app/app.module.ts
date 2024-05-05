import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgxMasonryModule } from 'ngx-masonry';
import { NgMagnizoomModule } from 'ng-magnizoom';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { CarouselModule } from "ngx-acuw";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TailwindcssComponent } from './components/tailwindcss/tailwindcss.component';
import { ActressesComponent } from './components/actresses/actresses.component';
import { PhotosComponent } from './components/photos/photos.component';
import { VideosComponent } from './components/videos/videos.component';
import { SafePipe } from './pipes/safe.pipe';
import { TopnavComponent } from './components/common/topnav/topnav.component';
import { LeftnavComponent } from './components/common/leftnav/leftnav.component';
import { environment } from '../environments/environment';
import { VideoplayerComponent } from './components/common/videoplayer/videoplayer.component';
import { SearchbarComponent } from './components/common/searchbar/searchbar.component';
import { DouyinComponent } from './components/douyin/douyin.component';
import { HistoryComponent } from './components/history/history.component';
import { AlertComponent } from './components/common/alert/alert.component';
import { JasmineComponent } from './components/jasmine/jasmine.component';
import { ZtabComponent } from './components/ztab/ztab.component';

@NgModule({
  declarations: [
    AppComponent,
    TailwindcssComponent,
    ActressesComponent,
    PhotosComponent,
    VideosComponent,
    SafePipe,
    TopnavComponent,
    LeftnavComponent,
    VideoplayerComponent,
    SearchbarComponent,
    DouyinComponent,
    HistoryComponent,
    AlertComponent,
    JasmineComponent,
    ZtabComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    NgxMasonryModule,
    BrowserAnimationsModule,
    NgMagnizoomModule,
    PinchZoomModule,
    CarouselModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
