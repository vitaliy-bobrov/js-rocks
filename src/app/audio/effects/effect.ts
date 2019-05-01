import { BehaviorSubject } from 'rxjs';

export interface EffectInfo {
  model: string;
  params: {
    active: boolean;
  };
}

export abstract class Effect {
  private activeSub$ = new BehaviorSubject<boolean>(false);
  private isBypassEnabled = true;
  protected processor: AudioNode[] = [];
  protected sampleRate: number;
  input: GainNode;
  output: GainNode;
  active$ = this.activeSub$.asObservable();

  static connectInOrder(effects: Effect[]) {
    for (let i = effects.length - 1; i > 0; --i) {
      effects[i - 1].connect(effects[i]);
    }
  }

  static disconnectInOrder(effects: Effect[]) {
    for (const effect of effects) {
      effect.disconnect();
    }
  }

  set active(value: boolean) {
    if (this.isBypassEnabled !== !value) {
      this.toggleBypass();
    }
  }

  constructor(context: AudioContext, public model: string) {
    this.sampleRate = context.sampleRate;
    this.input = context.createGain();
    this.output = context.createGain();
    this.activeSub$.next(false);
  }

  toggleBypass() {
    this.isBypassEnabled = !this.isBypassEnabled;

    if (this.isBypassEnabled) {
      if (this.processor.length) {
        this.processor[this.processor.length - 1].disconnect();
      }

      this.input.disconnect();
      this.input.connect(this.output);
    } else {
      this.input.disconnect();
      this.input.connect(this.processor[0]);
      this.processor[this.processor.length - 1].connect(this.output);
    }

    this.activeSub$.next(!this.isBypassEnabled);
  }

  connect(effect: Effect) {
    this.output.connect(effect.input);
  }

  disconnect() {
    this.output.disconnect();
  }

  dispose() {
    this.disconnect();

    for (const node of this.processor) {
      node.disconnect();
    }

    this.processor = [];
    this.input = null;
    this.output = null;
    this.isBypassEnabled = false;
    this.activeSub$.complete();
  }

  takeSnapshot(): EffectInfo {
    return {
      model: this.model,
      params: {
        active: this.activeSub$.value
      }
    };
  }
}
