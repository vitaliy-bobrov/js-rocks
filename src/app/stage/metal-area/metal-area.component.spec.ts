import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetalAreaComponent } from './metal-area.component';

xdescribe('MetalAreaComponent', () => {
  let component: MetalAreaComponent;
  let fixture: ComponentFixture<MetalAreaComponent>;

  beforeEach(async(() => {
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
