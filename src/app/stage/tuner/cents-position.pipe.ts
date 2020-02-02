import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'centsPosition',
  pure: true
})
export class CentsPositionPipe implements PipeTransform {
  transform(cents: number | null): string {
    if (cents === null || cents === 0 || Math.abs(cents) < 4) {
      return '0';
    }

    return `${Math.round(cents / 5) * 8}px`;
  }
}
