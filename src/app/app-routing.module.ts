import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { TailwindcssComponent } from './components/tailwindcss/tailwindcss.component';
import { ActressesComponent } from './components/actresses/actresses.component';
import { PhotosComponent } from './components/photos/photos.component';
import { VideosComponent } from './components/videos/videos.component';
import { DouyinComponent } from './components/douyin/douyin.component';
import { HistoryComponent } from './components/history/history.component';
import { JasmineComponent } from './components/jasmine/jasmine.component';
import { ZtabComponent } from './components/ztab/ztab.component';

const routes: Routes = [
  { path: '', component: TailwindcssComponent },
  { path: 'accueil', component: TailwindcssComponent },
  { path: 'tailwindcss/:token', component: TailwindcssComponent },
  { path: 'actrices', component: ActressesComponent, canActivate: [AuthGuard] },
  { path: 'photos', component: PhotosComponent, canActivate: [AuthGuard] },
  { path: 'videos', component: VideosComponent, canActivate: [AuthGuard] },
  { path: 'douyin', component: DouyinComponent, canActivate: [AuthGuard] },
  { path: 'jasmine', component: JasmineComponent, canActivate: [AuthGuard] },
  { path: 'historique', component: HistoryComponent, canActivate: [AuthGuard] },
  { path: 'ztab', component: ZtabComponent },
  { path: '**', component: TailwindcssComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
