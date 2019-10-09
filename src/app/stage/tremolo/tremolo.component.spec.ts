import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TremoloComponent } from './tremolo.component';

xdescribe('TremoloComponent', () => {
  let component: TremoloComponent;
  let fixture: ComponentFixture<TremoloComponent>;

  beforeEach(async(() => {
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
