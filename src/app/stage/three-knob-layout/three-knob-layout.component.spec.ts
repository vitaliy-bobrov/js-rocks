import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeKnobLayoutComponent } from './three-knob-layout.component';

describe('ThreeKnobLayoutComponent', () => {
  let component: ThreeKnobLayoutComponent;
  let fixture: ComponentFixture<ThreeKnobLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThreeKnobLayoutComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreeKnobLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
