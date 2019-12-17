import { AudioContext, AnalyserNode } from 'standardized-audio-context';
import { BehaviorSubject, interval } from 'rxjs';
import { tap, takeWhile } from 'rxjs/operators';
import { Effect } from '../effect';
import { Active } from '@audio/interfaces/active.interface';
import { connectNodes } from '@shared/utils';
import { Note, TunerResponseMessage } from './tuner.interface';

export class Tuner extends Effect<Active> {
  private worker: Worker;
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

    this.worker = new Worker('./tuner.worker', { type: 'module' });
    this.worker.onmessage = ({ data }: TunerResponseMessage) => {
      this.noteSub$.next(data.note);
      this.centsSub$.next(data.cents);
    };

    this.detectPitch = this.detectPitch.bind(this);
  }

  toggleBypass() {
    super.toggleBypass();

    if (this.isBypassEnabled) {
      this.noteSub$.next(null);
      this.centsSub$.next(null);
    } else {
      interval(100)
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
    this.analyserNode.disconnect();
    this.analyserNode = null;
    this.noteSub$.complete();
    this.centsSub$.complete();
  }

  private detectPitch() {
    const buffer = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(buffer);

    this.worker.postMessage({ buffer, sampleRate: this.sampleRate });
  }
}
