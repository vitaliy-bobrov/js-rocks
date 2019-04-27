import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { Cabinet } from '@audio/effects/cabinet';
import { ConvolverService } from '@audio/convolver.service';

interface CabinetModel {
  model: string;
  path: string;
  gain: number;
}

@Component({
  selector: 'jsr-amp',
  templateUrl: './amp.component.html',
  styleUrls: ['./amp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmpComponent implements OnInit, OnDestroy {
  effect: Cabinet;
  masterVolume$ = this.manager.master$;

  cabinets: CabinetModel[] = [
    {
      model: 'Celesticco',
      path: 'cenzo_celestion_v30_mix.wav',
      gain: 4
    },
    {
      model: 'Franklinstein',
      path: 'framus_4x12_v30_sm57.wav',
      gain: 15
    },
    {
      model: 'MegaStorm',
      path: 'mesa_oversized_v30_edge_sneap_1.wav',
      gain: 15
    },
    {
      model: 'Yellow Submarine',
      path: 'yellow.ogg',
      gain: 24
    },
    {
      model: 'Captain 1960',
      path: 'Marshall1960A-G12Ms-SM57-Cone-0.5in.wav',
      gain: 6
    }
  ];

  selectedModel = this.cabinets[4];

  constructor(
    private manager: AudioContextManager,
    private convolverService: ConvolverService
  ) {}

  ngOnInit() {
    const convolver = this.convolverService
      .loadIR(this.manager.context, this.selectedModel.path);
    this.effect = new Cabinet(this.manager.context, convolver, this.selectedModel.gain);
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.effect.dispose();
  }

  updateMasterVolume(value: number) {
    this.manager.master = value;
  }

  selectCabinet(cabinet: CabinetModel) {
    this.selectedModel = cabinet;
    const convolver = this.convolverService
      .loadIR(this.manager.context, this.selectedModel.path);
    this.effect.updateConvolver(convolver, this.selectedModel.gain);
  }
}
