import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DelayComponent } from './delay.component';

xdescribe('DelayComponent', () => {
  let component: DelayComponent;
  let fixture: ComponentFixture<DelayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DelayComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DelayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
