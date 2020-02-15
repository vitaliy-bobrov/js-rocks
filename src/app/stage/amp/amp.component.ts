import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { Cabinet, CabinetInfo } from '@audio/effects/cabinet';
import { ConvolverService } from '@audio/convolver.service';

interface CabinetModel {
  brand: string;
  model: string;
  path: string;
  volume: number;
  maxVolume: number;
  theme?: string;
  logo?: string;
  logoViewBox?: string;
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
      brand: 'Captain',
      model: 'JCM800', // Marshall JCM800
      path: 'cabinet/captain_1960.wav',
      volume: 3,
      maxVolume: 5,
      theme: 'marshall',
      logo: '/assets/svg/brands/captain.svg#logo',
      logoViewBox: '0 0 220 85'
    },
    {
      brand: 'Friender',
      model: 'Winner', // Fender Champion
      path: 'cabinet/friender_winner.wav',
      volume: 5,
      maxVolume: 9,
      theme: 'champion',
      logo: '/assets/svg/brands/friender.svg#logo',
      logoViewBox: '0 0 377 91'
    },
    {
      brand: 'Friender',
      model: 'Bassman', // Fender Bassman
      path: 'cabinet/friender_bassman.wav',
      volume: 16,
      maxVolume: 31,
      theme: 'bassman',
      logo: '/assets/svg/brands/friender.svg#logo',
      logoViewBox: '0 0 377 91'
    },
    {
      brand: 'FOX',
      model: 'AC30', // Vox AC30
      path: 'cabinet/fox_ac30.wav',
      volume: 9,
      maxVolume: 17
    },
    {
      brand: 'Franklin',
      model: 'Stein', // Framus
      path: 'cabinet/franklinstein.wav',
      volume: 15,
      maxVolume: 29
    },
    {
      brand: 'Mega',
      model: 'Woody', // Mesa Boogie
      path: 'cabinet/mega_storm.wav',
      volume: 6,
      maxVolume: 11
    },
    {
      brand: 'Yellow',
      model: 'Submarine', // Orange
      path: 'cabinet/yellow.wav',
      volume: 24,
      maxVolume: 47
    },
    {
      brand: 'Eagle',
      model: 'Pro', // ENGL Pro
      path: 'cabinet/eagle_pro.wav',
      volume: 6,
      maxVolume: 11
    },
    {
      brand: 'Sandman',
      model: '2204',
      path: 'cabinet/sandman_2204.wav',
      volume: 7,
      maxVolume: 13
    }
  ];
  defaultCabinet = this.cabinets[0];
  selectedModel = this.defaultCabinet;

  @Input()
  config: CabinetInfo;

  constructor(
    private manager: AudioContextManager,
    private convolverService: ConvolverService
  ) {}

  ngOnInit() {
    const buffer$ = this.convolverService.loadIR(
      this.manager.context,
      this.selectedModel.path
    );
    this.effect = new Cabinet(
      this.manager.context,
      this.selectedModel.model,
      buffer$,
      this.selectedModel.volume,
      this.selectedModel.maxVolume
    );
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
    const convolver = this.convolverService.loadIR(
      this.manager.context,
      this.selectedModel.path
    );
    this.effect.updateConvolver(
      convolver,
      this.selectedModel.volume,
      this.selectedModel.maxVolume,
      this.selectedModel.model
    );
  }

  private setupConfig() {
    this.selectedModel =
      this.cabinets.find(cabinet => cabinet.model === this.config.model) ||
      this.defaultCabinet;

    this.effect.bass = this.config.params.bass;
    this.effect.mid = this.config.params.mid;
    this.effect.treble = this.config.params.treble;
    this.effect.gain = this.config.params.gain || this.selectedModel.volume;

    this.updateMasterVolume(this.config.params.volume);

    if (typeof this.config.params.active !== 'undefined') {
      this.effect.active = this.config.params.active;
    }

    this.selectCabinet(this.selectedModel);
  }
}
