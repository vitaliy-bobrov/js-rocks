import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pitchClassName',
  pure: true
})
export class PitchClassNamePipe implements PipeTransform {
  transform(cents: number | null): Record<string, boolean> {
    const isAccurate = Math.abs(cents) - 5 < 0;
    const notNull = cents !== null;

    return {
      accurate: notNull && isAccurate,
      inaccurate: notNull && !isAccurate
    };
  }
}
