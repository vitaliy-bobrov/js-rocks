import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valueLabel',
  pure: true
})
export class ValueLabelPipe implements PipeTransform {
  transform(value: number, units = '', showSign = false) {
    const sign = showSign && value > 0 ? '+' : '';

    return `${sign}${value}${units ? ' ' + units : ''}`;
  }
}
