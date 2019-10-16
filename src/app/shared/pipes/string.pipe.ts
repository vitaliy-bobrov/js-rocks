import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'string',
  pure: true
})
export class StringPipe implements PipeTransform {
  transform(value: number): string {
    return value.toString();
  }
}
