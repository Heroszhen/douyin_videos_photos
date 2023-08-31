import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService {
  protected httpOptions = {};
  protected httpOptionsAuth: object = {};
  protected baseUrl: string = '';//server of ad
  protected baseUrl2: string = "";//server of backend
  protected authToken: string | null = '';

  constructor(protected http: HttpClient) {
    this.baseUrl = environment.baseUrlAD;
    this.baseUrl2 = environment.baseUrlBack;

    this.authToken = localStorage.getItem("token");
    this.refreshHttpOptions();
  }

  refreshHttpOptions() {
    this.httpOptionsAuth = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`,
        'X-Requested-With': 'XMLHttpRequest'
      })
    }

    this.httpOptions = {
      headers: new HttpHeaders({})
    }
  }

  getHttpOptionsAuth(options:object = null!): object {
    this.httpOptionsAuth = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
        'X-Requested-With': 'XMLHttpRequest',
        'ngsw-bypass': ''
      })
    }

    if (options !== null)this.httpOptionsAuth = {...this.httpOptionsAuth, ...options};

    return this.httpOptionsAuth;
  }
}
