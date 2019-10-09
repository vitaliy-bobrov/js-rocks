import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BluesDriverComponent } from './blues-driver.component';

xdescribe('BluesDriverComponent', () => {
  let component: BluesDriverComponent;
  let fixture: ComponentFixture<BluesDriverComponent>;

  beforeEach(async(() => {
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
