import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MassiveMuffPiComponent } from './massive-muff-pi.component';

xdescribe('MassiveMuffPiComponent', () => {
  let component: MassiveMuffPiComponent;
  let fixture: ComponentFixture<MassiveMuffPiComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MassiveMuffPiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MassiveMuffPiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
