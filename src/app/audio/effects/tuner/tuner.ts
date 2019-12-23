import {
  AnalyserNode,
  AudioContext,
  BiquadFilterNode
} from 'standardized-audio-context';
import { BehaviorSubject, interval } from 'rxjs';
import { takeWhile, tap } from 'rxjs/operators';
import { Effect } from '../effect';
import { Active } from '@audio/interfaces/active.interface';
import { connectNodes } from '@shared/utils';
import { Note, TunerResponseMessage } from './tuner.interface';

export class Tuner extends Effect<Active> {
  private worker: Worker;
  private preHPFilter: BiquadFilterNode<AudioContext>;
  private analyserNode: AnalyserNode<AudioContext>;
  private noteSub$ = new BehaviorSubject<Note>(null);

  note$ = this.noteSub$.asObservable();

  constructor(
    context: AudioContext,
    model: string,
    protected defaults: Active
  ) {
    super(context, model);

    this.preHPFilter = new BiquadFilterNode(context, {
      type: 'highpass',
      Q: Math.SQRT1_2,
      frequency: 20
    });

    this.analyserNode = new AnalyserNode(context, {
      fftSize: 4096
    });

    this.processor = [this.preHPFilter, this.analyserNode];
    connectNodes(this.processor);
    this.applyDefaults();

    this.worker = new Worker('./tuner.worker', { type: 'module' });
    this.worker.onmessage = ({ data }: TunerResponseMessage) => {
      if (this.isBypassEnabled) {
        return;
      }

      this.noteSub$.next(data.note);
    };

    this.detectPitch = this.detectPitch.bind(this);
  }

  toggleBypass() {
    super.toggleBypass();

    if (this.isBypassEnabled) {
      this.noteSub$.next(null);
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
    this.preHPFilter.disconnect();
    this.preHPFilter = null;
    this.analyserNode.disconnect();
    this.analyserNode = null;
    this.noteSub$.complete();
  }

  private detectPitch() {
    const buffer = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(buffer);

    this.worker.postMessage({ buffer, sampleRate: this.sampleRate });
  }
}
