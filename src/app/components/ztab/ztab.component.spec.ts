import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZtabComponent } from './ztab.component';

describe('ZtabComponent', () => {
  let component: ZtabComponent;
  let fixture: ComponentFixture<ZtabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZtabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZtabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
