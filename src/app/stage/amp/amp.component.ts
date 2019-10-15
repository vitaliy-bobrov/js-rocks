import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  SimpleChanges,
  OnChanges } from '@angular/core';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { Cabinet, CabinetInfo } from '@audio/effects/cabinet';
import { ConvolverService } from '@audio/convolver.service';

interface CabinetModel {
  model: string;
  path: string;
  gain: number;
  maxGain: number;
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
      model: 'Captain 1960',
      path: 'cabinet/captain_1960.wav',
      gain: 3,
      maxGain: 5
    },
    {
      model: 'Friender Winner',
      path: 'cabinet/friender_winner.wav',
      gain: 5,
      maxGain: 9
    },
    {
      model: 'Friender Bassman',
      path: 'cabinet/friender_bassman.wav',
      gain: 16,
      maxGain: 31
    },
    {
      model: 'Enzo Celesticco',
      path: 'cabinet/enzo_celesticco.wav',
      gain: 2,
      maxGain: 3
    },
    {
      model: 'Fox AC30',
      path: 'cabinet/fox_ac30.wav',
      gain: 9,
      maxGain: 17
    },
    {
      model: 'FranklinStein',
      path: 'cabinet/franklinstein.wav',
      gain: 15,
      maxGain: 29,
    },
    {
      model: 'MegaStorm',
      path: 'cabinet/mega_storm.wav',
      gain: 6,
      maxGain: 11
    },
    {
      model: 'Yellow Submarine',
      path: 'cabinet/yellow.wav',
      gain: 24,
      maxGain: 47
    },
    {
      model: 'Eagle Pro',
      path: 'cabinet/eagle_pro.wav',
      gain: 6,
      maxGain: 11
    },
    {
      model: 'Sandman 2204',
      path: 'cabinet/sandman_2204.wav',
      gain: 7,
      maxGain: 13
    }
  ];
  defaultCabinet = this.cabinets[0];
  selectedModel = this.defaultCabinet;

  @Input()
  config: CabinetInfo;

  constructor(
    private manager: AudioContextManager,
    private convolverService: ConvolverService) {}

  ngOnInit() {
    const buffer$ = this.convolverService
      .loadIR(this.manager.context, this.selectedModel.path);
    this.effect = new Cabinet(
      this.manager.context,
      this.selectedModel.model,
      buffer$,
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
