import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule
} from '@angular/core';
import { BitMaskPipe } from './bit-mask.pipe';

@Component({
  selector: 'jsr-seven-segment-lcd',
  templateUrl: './seven-segment-lcd.component.html',
  styleUrls: ['./seven-segment-lcd.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SevenSegmentLcdComponent {
  private static dictionary = new Map([
    ['a', 0b1111110],
    ['b', 0b1001111],
    ['c', 0b1101001],
    ['d', 0b0011111],
    ['e', 0b1101101],
    ['f', 0b1101100],
    ['g', 0b1101011]
  ]);

  segmentAMask = 0b1000000;
  segmentBMask = 0b0100000;
  segmentCMask = 0b0010000;
  segmentDMask = 0b0001000;
  segmentEMask = 0b0000100;
  segmentFMask = 0b0000010;
  segmentGMask = 0b0000001;

  normalizedSymbol: number | null = null;

  @Input()
  set symbol(value: string) {
    const lowerValue = value ? value.toLowerCase() : value;
    this.normalizedSymbol = SevenSegmentLcdComponent.dictionary.get(lowerValue);
  }
}

@NgModule({
  declarations: [BitMaskPipe, SevenSegmentLcdComponent],
  exports: [SevenSegmentLcdComponent]
})
export class SevenSegmentLcdModule {}
