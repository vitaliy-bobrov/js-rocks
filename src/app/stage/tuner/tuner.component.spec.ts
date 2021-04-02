import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TunerComponent } from './tuner.component';
import { SevenSegmentLcdModule } from '../seven-segment-lcd/seven-segment-lcd.component';

xdescribe('TunerComponent', () => {
  let component: TunerComponent;
  let fixture: ComponentFixture<TunerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TunerComponent, SevenSegmentLcdModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TunerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
