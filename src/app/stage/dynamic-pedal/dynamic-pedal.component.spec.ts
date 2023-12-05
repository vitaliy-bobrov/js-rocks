import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicPedalComponent } from './dynamic-pedal.component';

xdescribe('DynamicPedalComponent', () => {
  let component: DynamicPedalComponent;
  let fixture: ComponentFixture<DynamicPedalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicPedalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicPedalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
