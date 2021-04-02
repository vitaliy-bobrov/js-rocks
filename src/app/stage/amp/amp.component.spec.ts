import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AmpComponent } from './amp.component';

xdescribe('AmpComponent', () => {
  let component: AmpComponent;
  let fixture: ComponentFixture<AmpComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AmpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
