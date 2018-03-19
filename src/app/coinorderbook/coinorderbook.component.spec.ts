import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinorderbookComponent } from './coinorderbook.component';

describe('CoinorderbookComponent', () => {
  let component: CoinorderbookComponent;
  let fixture: ComponentFixture<CoinorderbookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoinorderbookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinorderbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
