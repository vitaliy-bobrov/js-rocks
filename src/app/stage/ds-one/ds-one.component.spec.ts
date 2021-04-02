import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DsOneComponent } from './ds-one.component';

xdescribe('DsOneComponent', () => {
  let component: DsOneComponent;
  let fixture: ComponentFixture<DsOneComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DsOneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DsOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
