import { AudioContext, GainNode, IAudioNode } from 'standardized-audio-context';
import { BehaviorSubject } from 'rxjs';

import { Active } from '@audio/interfaces/active.interface';
import { EffectNode } from '@audio/interfaces/node.interface';
import { Disposable } from '@audio/interfaces/disposable.interface';

/**
 * Minimal effect information interface to extend.
 */
export interface EffectInfo {
  model: string;
  params: {
    active: boolean;
  };
}

/**
 * Base audio effect class.
 */
export abstract class Effect<D extends Active> implements Disposable {
  private activeSub$ = new BehaviorSubject(false);
  private context: AudioContext;
  protected defaults: D;
  protected isBypassEnabled: boolean;
  protected processor: IAudioNode<AudioContext>[] = [];

  input: GainNode<AudioContext>;
  output: GainNode<AudioContext>;

  /**
   * Active effect state stream.
   */
  active$ = this.activeSub$.asObservable();

  // TODO: Move to context manager.
  static connectInOrder(effects: Required<EffectNode>[]) {
    for (let i = effects.length - 1; i > 0; --i) {
      effects[i - 1].connect(effects[i]);
    }
  }

  // TODO: Move to context manager.
  static disconnectInOrder(effects: Required<EffectNode>[]) {
    for (const effect of effects) {
      effect.disconnect();
    }
  }

  /**
   * Whether an effect is active or bypassed.
   */
  set active(value: boolean) {
    if (value && typeof this.isBypassEnabled === 'undefined') {
      this.toggleBypass();
      this.toggleBypass();
    }

    if (this.isBypassEnabled !== !value) {
      this.toggleBypass();
    }
  }

  /**
   * Audio context time.
   */
  get currentTime(): number {
    return this.context.currentTime;
  }

  /**
   * Audio context sample rate.
   */
  get sampleRate(): number {
    return this.context.sampleRate;
  }

  constructor(context: AudioContext, public model: string) {
    this.context = context;
    this.input = context.createGain();
    this.output = context.createGain();
    this.activeSub$.next(false);
  }

  /**
   * Applies default parameters to effect properties.
   */
  applyDefaults() {
    Object.keys(this.defaults).forEach(option => {
      this[option] = this.defaults[option];
    });
  }

  /**
   * Toggles effect bypass based on current state.
   */
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

  /**
   * Connects effect to another effect.
   */
  connect(effect: Effect<any>) {
    this.output.connect(effect.input);
  }

  /**
   * Disconnects effect from another effect.
   */
  disconnect() {
    this.output.disconnect();
  }

  /**
   * Cleanups all audio nodes and streams.
   */
  dispose() {
    this.disconnect();

    for (const node of this.processor) {
      node.disconnect();
    }

    this.input.disconnect();

    this.processor = [];
    this.input = null;
    this.output = null;
    this.context = null;
    this.activeSub$.complete();
    this.isBypassEnabled = true;
  }

  /**
   * Creates current effect configuration snapshot.
   */
  takeSnapshot(): EffectInfo {
    return {
      model: this.model,
      params: {
        active: this.activeSub$.value
      }
    };
  }
}
