import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bitMask',
  pure: true
})
export class BitMaskPipe implements PipeTransform {
  transform(value: number, mask: number): boolean {
    if (typeof value === 'undefined' || value === null) {
      return false;
    }

    return (value & mask) !== 0;
  }
}
