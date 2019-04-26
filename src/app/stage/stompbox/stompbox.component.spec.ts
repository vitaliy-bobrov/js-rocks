import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StompboxComponent } from './stompbox.component';

describe('StompboxComponent', () => {
  let component: StompboxComponent;
  let fixture: ComponentFixture<StompboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StompboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StompboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
