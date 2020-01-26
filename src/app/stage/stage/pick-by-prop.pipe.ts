import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pickByProp',
  pure: true
})
export class PickByPropPipe implements PipeTransform {
  transform<T>(items: Array<T>, prop: string, value: unknown): T[] {
    if (!items) {
      return items;
    }
    return items.filter(item => item[prop] === value);
  }
}
