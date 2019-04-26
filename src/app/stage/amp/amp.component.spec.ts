import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmpComponent } from './amp.component';

describe('AmpComponent', () => {
  let component: AmpComponent;
  let fixture: ComponentFixture<AmpComponent>;

  beforeEach(async(() => {
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
