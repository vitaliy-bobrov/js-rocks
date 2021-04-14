import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BluesDriverComponent } from './blues-driver.component';

xdescribe('BluesDriverComponent', () => {
  let component: BluesDriverComponent;
  let fixture: ComponentFixture<BluesDriverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BluesDriverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BluesDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
