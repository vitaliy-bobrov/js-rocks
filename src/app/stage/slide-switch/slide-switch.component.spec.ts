import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideSwitchComponent } from './slide-switch.component';

xdescribe('SlideSwitchComponent', () => {
  let component: SlideSwitchComponent;
  let fixture: ComponentFixture<SlideSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlideSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlideSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
