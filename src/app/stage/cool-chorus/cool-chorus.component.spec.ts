import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CoolChorusComponent } from './cool-chorus.component';

xdescribe('CoolChorusComponent', () => {
  let component: CoolChorusComponent;
  let fixture: ComponentFixture<CoolChorusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CoolChorusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolChorusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
