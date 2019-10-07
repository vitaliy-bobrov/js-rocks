import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MassiveMuffPiComponent } from './massive-muff-pi.component';

xdescribe('MassiveMuffPiComponent', () => {
  let component: MassiveMuffPiComponent;
  let fixture: ComponentFixture<MassiveMuffPiComponent>;

  beforeEach(async(() => {
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
