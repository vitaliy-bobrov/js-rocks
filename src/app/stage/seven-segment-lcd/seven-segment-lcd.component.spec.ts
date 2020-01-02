import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SevenSegmentLcdComponent } from './seven-segment-lcd.component';
import { BitMaskPipe } from './bit-mask.pipe';

describe('SevenSegmentLcdComponent', () => {
  let component: SevenSegmentLcdComponent;
  let fixture: ComponentFixture<SevenSegmentLcdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SevenSegmentLcdComponent, BitMaskPipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SevenSegmentLcdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
