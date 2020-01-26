import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoftYellowTremoloComponent } from './soft-yellow-tremolo.component';

xdescribe('SoftYellowTremoloComponent', () => {
  let component: SoftYellowTremoloComponent;
  let fixture: ComponentFixture<SoftYellowTremoloComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SoftYellowTremoloComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoftYellowTremoloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
