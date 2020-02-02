import {
  AnalyserNode,
  AudioContext,
  BiquadFilterNode
} from 'standardized-audio-context';
import { BehaviorSubject, interval } from 'rxjs';
import { takeWhile, tap } from 'rxjs/operators';
import { Effect } from '../effect';
import { Active } from '@audio/interfaces/active.interface';
import { Note, TunerResponseMessage } from './tuner.interface';

export class Tuner extends Effect<Active> {
  private static readonly emptyNote: Note = {
    symbol: '',
    frequency: null,
    octave: null,
    cents: null
  };
  private worker: Worker;
  private preHPFilter: BiquadFilterNode<AudioContext>;
  private analyserNode: AnalyserNode<AudioContext>;
  private noteSub$ = new BehaviorSubject<Note>(Tuner.emptyNote);

  note$ = this.noteSub$.asObservable();

  constructor(context: AudioContext, id: string, protected defaults: Active) {
    super(context, id);

    this.preHPFilter = new BiquadFilterNode(context, {
      type: 'highpass',
      Q: Math.SQRT1_2,
      frequency: 20
    });

    this.analyserNode = new AnalyserNode(context, {
      fftSize: 4096
    });

    this.processor = [this.preHPFilter, this.analyserNode];
    this.connectNodes(this.processor);
    this.applyDefaults();

    this.worker = new Worker('./tuner.worker', { type: 'module' });
    this.worker.onmessage = ({ data }: TunerResponseMessage) => {
      if (this.isBypassEnabled) {
        return;
      }

      this.noteSub$.next(data.note ?? Tuner.emptyNote);
    };

    this.detectPitch = this.detectPitch.bind(this);
  }

  toggleBypass() {
    super.toggleBypass();

    if (this.isBypassEnabled) {
      this.noteSub$.next(Tuner.emptyNote);
    } else {
      interval(300)
        .pipe(
          tap(this.detectPitch),
          takeWhile(() => !this.isBypassEnabled)
        )
        .subscribe();
    }
  }

  dispose() {
    super.dispose();

    this.worker.terminate();
    this.noteSub$.complete();
  }

  private detectPitch() {
    const buffer = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(buffer);

    this.worker.postMessage({ buffer, sampleRate: this.sampleRate });
  }
}
