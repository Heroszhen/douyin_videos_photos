import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  connected$ = new BehaviorSubject<Array<boolean>>([false]);
  user$ = new BehaviorSubject<Array<object>>([]);
  topNavheight:number = 50;
  toSearch$ = new BehaviorSubject<Array<boolean>>([false]);
  loading$ = new BehaviorSubject<Array<boolean|string>>([false, ""]);
  constructor() { }
}
