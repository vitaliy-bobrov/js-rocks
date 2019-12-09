import { AudioContext, AnalyserNode } from 'standardized-audio-context';
import { BehaviorSubject, interval, animationFrameScheduler } from 'rxjs';
import { tap, takeWhile } from 'rxjs/operators';
import { Effect } from './effect';
import { Active } from '@audio/interfaces/active.interface';
import { Note, notes } from '@audio/notes';
import { connectNodes } from '@shared/utils';

export class Tuner extends Effect<Active> {
  private analyserNode: AnalyserNode<AudioContext>;
  private noteSub$ = new BehaviorSubject<Note>(null);
  private centsSub$ = new BehaviorSubject<number>(null);

  note$ = this.noteSub$.asObservable();
  cents$ = this.centsSub$.asObservable();

  constructor(
    context: AudioContext,
    model: string,
    protected defaults: Active
  ) {
    super(context, model);

    this.analyserNode = new AnalyserNode(context, {
      fftSize: 4096
    });

    this.processor = [this.analyserNode];
    connectNodes(this.processor);
    this.applyDefaults();
    this.detectPitch = this.detectPitch.bind(this);
  }

  toggleBypass() {
    super.toggleBypass();

    if (this.isBypassEnabled) {
      this.noteSub$.next(null);
      this.centsSub$.next(null);
    } else {
      interval(null, animationFrameScheduler)
        .pipe(
          tap(this.detectPitch),
          takeWhile(() => !this.isBypassEnabled)
        )
        .subscribe();
    }
  }

  dispose() {
    super.dispose();

    this.analyserNode.disconnect();
    this.analyserNode = null;
    this.noteSub$.complete();
    this.centsSub$.complete();
  }

  private detectPitch() {
    const buffer = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(buffer);

    const fundamentalFreq = this.findFundamentalFreq(buffer);

    if (fundamentalFreq !== -1) {
      const note = this.findClosestNote(fundamentalFreq);
      const cents = this.findCentsOffPitch(fundamentalFreq, note.frequency);
      this.noteSub$.next(note);
      this.centsSub$.next(cents);
      console.log(note);
      console.log(cents);
    } else {
      this.noteSub$.next(null);
      this.centsSub$.next(null);
    }
  }

  /**
   * Returns closes fundamental frequency using autocorrelation.
   * https://en.wikipedia.org/wiki/Autocorrelation
   */
  private findFundamentalFreq(buffer: Uint8Array) {
    const len = 250;
    let sum = 0;
    let prevSum = 0;
    let state = 0;
    let period = 0;
    let thresh = 0;

    for (let i = 0; i <= len; i++) {
      prevSum = sum;
      sum = 0;

      for (let k = 0; k < len - i; k++) {
        sum += ((buffer[k] - 128) * (buffer[i + k] - 128)) / 256;
      }

      // Peak Detect State Machine
      if (state === 2 && sum - prevSum <= 0) {
        period = i;
        break;
      }

      if (state === 1 && sum > thresh && sum - prevSum > 0) {
        state = 2;
      }

      if (!i) {
        thresh = sum / 2;
        state = 1;
      }
    }

    // Frequency identified in kHz
    return period ? this.sampleRate / (period * 2) : -1;
  }

  private findClosestNote(freq: number) {
    // Use binary search to find the closest note
    let low = -1;
    let high = notes.length;

    while (high - low > 1) {
      const pivot = Math.round((low + high) / 2);
      if (notes[pivot].frequency <= freq) {
        low = pivot;
      } else {
        high = pivot;
      }
    }

    if (
      Math.abs(notes[high].frequency - freq) <=
      Math.abs(notes[low].frequency - freq)
    ) {
      // notes[high] is closer to the frequency we found
      return notes[high];
    }

    return notes[low];
  }

  private findCentsOffPitch(freq: number, refFreq: number) {
    // We need to find how far freq is from baseFreq in cents
    const multiplicativeFactor = freq / refFreq;

    // We use Math.floor to get the integer part and ignore decimals
    return Math.floor(1200 * (Math.log(multiplicativeFactor) / Math.LN2));
  }
}
