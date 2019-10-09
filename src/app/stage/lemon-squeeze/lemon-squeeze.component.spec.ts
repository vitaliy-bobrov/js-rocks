import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LemonSqueezeComponent } from './lemon-squeeze.component';

xdescribe('LemonSqueezeComponent', () => {
  let component: LemonSqueezeComponent;
  let fixture: ComponentFixture<LemonSqueezeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LemonSqueezeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LemonSqueezeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
