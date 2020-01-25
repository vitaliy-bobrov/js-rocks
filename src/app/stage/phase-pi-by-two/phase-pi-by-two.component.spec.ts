import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhasePiByTwoComponent } from './phase-pi-by-two.component';

xdescribe('PhasePiByTwoComponent', () => {
  let component: PhasePiByTwoComponent;
  let fixture: ComponentFixture<PhasePiByTwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PhasePiByTwoComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhasePiByTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
