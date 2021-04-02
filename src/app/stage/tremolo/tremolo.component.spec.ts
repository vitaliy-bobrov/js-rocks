import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TremoloComponent } from './tremolo.component';

xdescribe('TremoloComponent', () => {
  let component: TremoloComponent;
  let fixture: ComponentFixture<TremoloComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TremoloComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TremoloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
