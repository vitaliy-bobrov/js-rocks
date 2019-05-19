import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  SimpleChanges,
  OnChanges } from '@angular/core';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { Cabinet } from '@audio/effects/cabinet';
import { ConvolverService } from '@audio/convolver.service';

interface CabinetModel {
  model: string;
  path: string;
  gain: number;
  maxGain: number;
}

interface CabinetConfig {
  model: string;
  params: {
    volume: number;
    gain: number;
    bass: number;
    mid: number;
    treble: number;
    active: boolean;
  };
}

@Component({
  selector: 'jsr-amp',
  templateUrl: './amp.component.html',
  styleUrls: ['./amp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmpComponent implements OnInit, OnDestroy, OnChanges {
  effect: Cabinet;
  masterVolume$ = this.manager.master$;

  cabinets: CabinetModel[] = [
    {
      model: 'Celesticco',
      path: 'cenzo_celestion_v30_mix.wav',
      gain: 4,
      maxGain: 10
    },
    {
      model: 'Franklinstein',
      path: 'framus_4x12_v30_sm57.wav',
      gain: 15,
      maxGain: 25,
    },
    {
      model: 'MegaStorm',
      path: 'mesa_oversized_v30_edge_sneap_1.wav',
      gain: 15,
      maxGain: 25
    },
    {
      model: 'Yellow Submarine',
      path: 'yellow.ogg',
      gain: 24,
      maxGain: 30
    },
    {
      model: 'Captain 1960',
      path: 'Marshall1960A-G12Ms-SM57-Cone-0.5in.wav',
      gain: 6,
      maxGain: 10
    }
  ];
  defaultCabinet = this.cabinets[3];
  selectedModel = this.defaultCabinet;

  @Input()
  config: CabinetConfig;

  constructor(
    private manager: AudioContextManager,
    private convolverService: ConvolverService) {}

  ngOnInit() {
    const convolver = this.convolverService
      .loadIR(this.manager.context, this.selectedModel.path);
    this.effect = new Cabinet(
      this.manager.context,
      this.selectedModel.model,
      convolver,
      this.selectedModel.gain,
      this.selectedModel.maxGain);
    this.manager.addEffect(this.effect, true);

    if (this.config) {
      this.setupConfig();
    }
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('config' in changes && !changes.config.firstChange) {
      this.setupConfig();
    }
  }

  updateMasterVolume(value: number) {
    this.manager.master = value;
  }

  selectCabinet(cabinet: CabinetModel) {
    this.selectedModel = cabinet;
    const convolver = this.convolverService
      .loadIR(this.manager.context, this.selectedModel.path);
    this.effect.updateConvolver(
      convolver,
      this.selectedModel.gain,
      this.selectedModel.maxGain,
      this.selectedModel.model);
  }

  private setupConfig() {
    this.selectedModel = this.cabinets
      .find(cabinet => cabinet.model === this.config.model) || this.defaultCabinet;

    this.selectCabinet(this.selectedModel);

    this.effect.bass = this.config.params.bass;
    this.effect.mid = this.config.params.mid;
    this.effect.treble = this.config.params.treble;
    this.effect.gain = this.config.params.gain || this.selectedModel.gain;

    this.updateMasterVolume(this.config.params.volume);

    if (typeof this.config.params.active !== 'undefined') {
      this.effect.active = this.config.params.active;
    }
  }
}
