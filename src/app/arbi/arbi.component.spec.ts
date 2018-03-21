import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArbiComponent } from './arbi.component';

describe('ArbiComponent', () => {
  let component: ArbiComponent;
  let fixture: ComponentFixture<ArbiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArbiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArbiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
