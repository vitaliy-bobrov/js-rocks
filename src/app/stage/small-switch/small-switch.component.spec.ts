import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallSwitchComponent } from './small-switch.component';

xdescribe('SmallSwitchComponent', () => {
  let component: SmallSwitchComponent;
  let fixture: ComponentFixture<SmallSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmallSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
