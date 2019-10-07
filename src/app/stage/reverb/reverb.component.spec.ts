import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReverbComponent } from './reverb.component';

xdescribe('ReverbComponent', () => {
  let component: ReverbComponent;
  let fixture: ComponentFixture<ReverbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReverbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReverbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
