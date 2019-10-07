import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LargeSwitchComponent } from './large-switch.component';

xdescribe('LargeSwitchComponent', () => {
  let component: LargeSwitchComponent;
  let fixture: ComponentFixture<LargeSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LargeSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LargeSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
