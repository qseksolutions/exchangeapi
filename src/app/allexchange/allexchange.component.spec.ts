import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllexchangeComponent } from './allexchange.component';

describe('AllexchangeComponent', () => {
  let component: AllexchangeComponent;
  let fixture: ComponentFixture<AllexchangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllexchangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllexchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
