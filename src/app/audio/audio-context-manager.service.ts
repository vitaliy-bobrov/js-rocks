import { Injectable, OnDestroy } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { BehaviorSubject } from 'rxjs';
import {
  AudioContext,
  GainNode,
  MediaStreamAudioSourceNode,
  MediaStreamAudioDestinationNode
} from 'standardized-audio-context';

import { Effect } from './effects/effect';
import { clamp } from '@audio/utils';
import { Preset } from './preset-manager.service';
import { CabinetInfo } from './effects/cabinet';
import { LocalStorageService } from '@shared/storage/local-storage.service';
import { AudioIO } from './interfaces/audio-io.interface';

@Injectable()
export class AudioContextManager implements OnDestroy {
  static readonly CURRENT_INPUT_KEY = 'jsr_current_input';
  static readonly CURRENT_OUTPUT_KEY = 'jsr_current_output';

  context: AudioContext;
  private effects: Effect<any>[] = [];
  private lineInSource: MediaStreamAudioSourceNode<AudioContext>;
  private audioElement = new Audio();
  private destination: MediaStreamAudioDestinationNode<AudioContext>;
  private masterGain: GainNode<AudioContext>;
  private masterSub$ = new BehaviorSubject(0);
  private inputSub$ = new BehaviorSubject<string>(null);
  private outputSub$ = new BehaviorSubject<string>(null);
  private inputs: AudioIO[] = [];
  private outputs: AudioIO[] = [];
  private createNewStream = true;

  readonly master$ = this.masterSub$.asObservable();
  readonly input$ = this.inputSub$.asObservable();
  readonly output$ = this.outputSub$.asObservable();

  set master(value: number) {
    const gain = clamp(0, 1, value);
    this.masterSub$.next(gain);
    this.masterGain.gain.setTargetAtTime(gain, this.context.currentTime, 0.01);
  }

  get inputDevices(): AudioIO[] {
    return this.inputs;
  }

  get outputDevices(): AudioIO[] {
    return this.outputs;
  }

  constructor(private storage: LocalStorageService) {
    this.getIODevices();
    this.context = new AudioContext({
      latencyHint: 'interactive'
    });
    this.destination = new MediaStreamAudioDestinationNode(this.context);
    this.masterGain = new GainNode(this.context);
    this.masterGain.connect(this.destination);
    this.masterSub$.next(1);
  }

  /**
   * Starts a stream with audio data. Creates a new stream
   * during the first execution or after input device update.
   */
  async plugLineIn(): Promise<void> {
    try {
      if (this.createNewStream) {
        this.disconnectAll();
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false,
            latency: 0,
            deviceId: this.inputSub$.value
          }
        });

        // Updating the input device again as there is
        // no guarantee the selected device will be used.
        const track = mediaStream.getAudioTracks()[0];
        this.saveInput(track.label);

        this.lineInSource = new MediaStreamAudioSourceNode(this.context, {
          mediaStream
        });
        this.createNewStream = false;

        this.audioElement.srcObject = this.destination.stream;
        this.saveOutput();
        this.audioElement.play();

        this.connectAll();
      }
    } catch (err) {
      // TODO: Show errors to the user.
      console.error(err);
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  async unplugLineIn(): Promise<void> {
    if (this.context.state === 'running') {
      await this.context.suspend();
    }
    this.audioElement.pause();
  }

  addEffect(effect: Effect<any>, post = false): void {
    this.disconnectAll();

    if (post) {
      this.effects.push(effect);
    } else {
      this.effects.splice(-1, 0, effect);
    }

    this.connectAll();
  }

  removeEffect(effect: Effect<any>): void {
    this.disconnectAll();
    this.effects = this.effects.filter(eff => eff !== effect);
    this.connectAll();
  }

  moveEffect(previousIndex: number, currentIndex: number): void {
    this.disconnectAll();
    moveItemInArray(this.effects, previousIndex, currentIndex);
    this.connectAll();
  }

  connectAll(): void {
    if (this.effects.length) {
      if (this.lineInSource) {
        this.lineInSource.connect(this.effects[0].input);
      }

      for (let i = this.effects.length - 1; i > 0; --i) {
        this.effects[i - 1].connect(this.effects[i]);
      }

      this.effects[this.effects.length - 1].output.connect(this.masterGain);
    } else if (this.lineInSource) {
      this.lineInSource.connect(this.masterGain);
    }
  }

  disconnectAll(): void {
    if (this.lineInSource) {
      this.lineInSource.disconnect();
    }

    for (const effect of this.effects) {
      effect.disconnect();
    }
  }

  takeSnapshot(): Preset {
    if (!this.effects.length) {
      return;
    }

    const cabinet = this.effects[
      this.effects.length - 1
    ].takeSnapshot() as CabinetInfo;
    cabinet.params.volume = this.masterSub$.value;

    const snapshot: Preset = {
      cabinet,
      pedals: []
    };

    for (let i = 0; i < this.effects.length - 1; i++) {
      const effectParams = this.effects[i].takeSnapshot();
      snapshot.pedals.push(effectParams);
    }

    return snapshot;
  }

  ngOnDestroy(): void {
    this.masterSub$.complete();
    this.inputSub$.complete();
    this.outputSub$.complete();
  }

  async changeInputDevice(id: string, active: boolean): Promise<void> {
    if (this.inputSub$.value !== id) {
      this.inputSub$.next(id);
      this.createNewStream = active;

      // If audio is enabled
      if (active) {
        await this.unplugLineIn();
        await this.plugLineIn();
      } else {
        await this.plugLineIn();
        await this.unplugLineIn();
      }
    }
  }

  async changeOutputDevice(id: string): Promise<void> {
    if (this.outputSub$.value !== id) {
      this.disconnectAll();
      await (this.audioElement as any).setSinkId(id);
      this.saveOutput();
      this.connectAll();
    }
  }

  private async getIODevices(): Promise<void> {
    if ('enumerateDevices' in navigator.mediaDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.inputs = [];
      this.outputs = [];

      for (const device of devices) {
        if (device.kind === 'audioinput' && device.label !== '') {
          this.inputs.push({ id: device.deviceId, label: device.label });
        }

        if (device.kind === 'audiooutput' && device.label !== '') {
          this.outputs.push({ id: device.deviceId, label: device.label });
        }
      }

      const previousInput = this.storage.getItem(
        AudioContextManager.CURRENT_INPUT_KEY
      );
      if (
        previousInput &&
        this.inputs.some(input => input.label === previousInput)
      ) {
        this.inputSub$.next(this.inputDeviceIdByLabel(previousInput));
      }

      const previousOutput = this.storage.getItem(
        AudioContextManager.CURRENT_OUTPUT_KEY
      );
      if (
        previousOutput &&
        this.outputs.some(output => output.label === previousOutput)
      ) {
        const deviceId = this.outputDeviceIdByLabel(previousOutput);
        this.outputSub$.next(deviceId);
        (this.audioElement as any).setSinkId(deviceId);
      }
    }
  }

  private inputDeviceIdByLabel(label: string) {
    return this.inputs.find(input => input.label === label)?.id;
  }

  private outputDeviceIdByLabel(label: string) {
    return this.outputs.find(input => input.label === label)?.id;
  }

  private saveInput(label: string) {
    this.inputSub$.next(this.inputDeviceIdByLabel(label));
    this.storage.setItem(AudioContextManager.CURRENT_INPUT_KEY, label);
  }

  private saveOutput() {
    const id = (this.audioElement as any).sinkId;
    const label = this.outputs.find(output => output.id === id)?.label;
    this.outputSub$.next(id);
    this.storage.setItem(AudioContextManager.CURRENT_OUTPUT_KEY, label);
  }
}
