import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { IData } from '../interfaces/IData';
import { StoreService } from './store.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService extends BaseService {
  constructor(
    http: HttpClient, 
    private storeService: StoreService,
    private router: Router
  ) {
    super(http);
  }

  // checkToken(token:string): Observable<IData> {
  //   localStorage.removeItem("token");
  //   this.httpOptionsAuth = {
  //     headers: new HttpHeaders({
  //       'Authorization': `Bearer ${token}`,
  //       'X-Requested-With': 'XMLHttpRequest'
  //     })
  //   }
    
  //   return this.http.get<IData>(`${this.baseUrl}/profile/check-login`, this.httpOptionsAuth);
  // }

  checkToken(token:string = ""): void {
    this.storeService.connected$.next([false]);
    localStorage.setItem('token', token);
    if(token !== "") {
      this.httpOptionsAuth = {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest'
        })
      }
      
      this.http.get<IData>(`${this.baseUrl2}/mk/jf/check-token-ad`, this.httpOptionsAuth).subscribe({
        next: (data:IData)=>{
          this.treatTokenResult(data)
        },
        error:(err)=>{
          console.log(err);
          this.treatTokenNegativeResult();
        }
      });
    }
  }

  treatTokenResult(data:IData): void {
    if (data["status"] === 1) {
      this.storeService.connected$.next([true]);
      this.storeService.user$.next([data.data])
    } else {
      this.treatTokenNegativeResult();
    }
  }

  treatTokenNegativeResult(): void {
    this.storeService.connected$.next([false]);
    this.storeService.user$.next([]);
    this.router.navigate(["/"]);
  }

  getGetVideos(pageItem:number): Observable<IData> {
    let params = new HttpParams().set('page', pageItem);
    
    return this.http.get<IData>(`${this.baseUrl2}/mk/jf/videos`, this.getHttpOptionsAuth({params: params}));
  }

  getSearchVideosByKeywords(keywords:string): Observable<IData> {
    let params = new HttpParams().set('keywords', keywords);

    return this.http.get<IData>(`${this.baseUrl2}/mk/jf/search-videos-by-keywords`, this.getHttpOptionsAuth({params: params}));
  }

  getGetVideosByKeywords(action:number, keywords:string, name:string, actressname:string, pageItem:number): Observable<IData>{
    let params = new HttpParams().set('page', pageItem);
    if (action === 2){
      params = params.set("keywords", keywords);
    } else if (action === 3) {
      params = params
        .set("name", name)
        .set("actressname", actressname);
    }

    return this.http.get<IData>(`${this.baseUrl2}/mk/jf/get-videos-by-keywords`, this.getHttpOptionsAuth({params: params}));
  }

  getGetVideoById(id:number): Observable<IData>{
    return this.http.get<IData>(`${this.baseUrl2}/mk/onevideo_web/${id}`, this.getHttpOptionsAuth());
  }
}
