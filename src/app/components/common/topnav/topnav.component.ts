import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-topnav',
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.scss']
})
export class TopnavComponent implements OnInit {
  @Output() toSwitchLeftNav = new EventEmitter();
  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
  }

  switchLeftNav(): void {
    this.toSwitchLeftNav.emit({status:1, data:""});
  }

  openSearchSection(): void {
    this.storeService.toSearch$.next([true]);
  }
}
