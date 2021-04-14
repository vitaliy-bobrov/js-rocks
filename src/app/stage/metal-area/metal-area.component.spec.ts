import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MetalAreaComponent } from './metal-area.component';

xdescribe('MetalAreaComponent', () => {
  let component: MetalAreaComponent;
  let fixture: ComponentFixture<MetalAreaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MetalAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetalAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
