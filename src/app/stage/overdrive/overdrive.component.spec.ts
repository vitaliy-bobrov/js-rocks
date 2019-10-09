import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverdriveComponent } from './overdrive.component';

xdescribe('OverdriveComponent', () => {
  let component: OverdriveComponent;
  let fixture: ComponentFixture<OverdriveComponent>;

  beforeEach(async(() => {
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
