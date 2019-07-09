import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Output,
  EventEmitter,
  HostBinding,
  ViewChild } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent } from '../pedal.interface';
import { ReverbSettings, Reverb } from '@audio/effects/reverb';
import { SwitchOption } from '../slide-switch/slide-switch.component';
import { ConvolverService } from '@audio/convolver.service';

interface ReverbConvolver extends SwitchOption {
  gain: number;
}

@Component({
  selector: 'jsr-reverb',
  templateUrl: './reverb.component.html',
  styleUrls: ['./reverb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReverbComponent implements OnInit, OnDestroy, PedalComponent<ReverbSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  @ViewChild(CdkDrag, { static: true })
  drag: CdkDrag;

  effect: Reverb;

  params: ReverbSettings = {
    level: 0.5,
    tone: 0.5,
    time: 2,
    active: false,
    type: 'Room'
  };

  types: ReverbConvolver[] = [
    {
      label: 'Spring',
      value: 'reverb/spring.wav',
      gain: 8
    },
    {
      label: 'Plate',
      value: 'reverb/plate.wav',
      gain: 5
    },
    {
      label: 'Hall',
      value: 'reverb/hall.wav',
      gain: 3
    },
    {
      label: 'Room',
      value: 'reverb/room.wav',
      gain: 5
    },
    {
      label: 'Space',
      value: 'reverb/space.wav',
      gain: 6
    }
  ];
  selectedType = this.types[3];

  constructor(
    private manager: AudioContextManager,
    private convolverService: ConvolverService) {}

  ngOnInit() {
    this.selectedType = this.typeByLabel(this.params.type);
    const buffer$ = this.convolverService.loadIR(this.manager.context, this.selectedType.value);
    this.effect = new Reverb(
      this.manager.context,
      'jrv-6',
      buffer$,
      this.selectedType.gain,
      this.params
    );
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }

  switchType(path: string) {
    this.selectedType = this.typeByValue(path);
    const buffer$ = this.convolverService.loadIR(this.manager.context, path);
    this.effect.updateConvolver(buffer$, this.selectedType.gain , this.selectedType.label);
  }

  private typeByLabel(label: string): ReverbConvolver {
    const item =  this.types.find((type) => type.label === label);
    return item || this.types[3];
  }

  private typeByValue(value: string): ReverbConvolver {
    const item =  this.types.find((type) => type.value === value);
    return item || this.types[3];
  }
}

