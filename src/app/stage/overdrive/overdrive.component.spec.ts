import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OverdriveComponent } from './overdrive.component';

xdescribe('OverdriveComponent', () => {
  let component: OverdriveComponent;
  let fixture: ComponentFixture<OverdriveComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OverdriveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverdriveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
