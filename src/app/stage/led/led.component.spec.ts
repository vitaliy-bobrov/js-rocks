import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedComponent } from './led.component';

describe('LedComponent', () => {
  let element: HTMLElement;
  let component: LedComponent;
  let fixture: ComponentFixture<LedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be inactive by default', () => {
    expect(element.classList).not.toContain('active');
  });

  it('should reflect active property', () => {
    component.active = true;
    fixture.detectChanges();

    expect(element.classList).toContain('active');

    component.active = false;
    fixture.detectChanges();

    expect(element.classList).not.toContain('active');
  });
});
