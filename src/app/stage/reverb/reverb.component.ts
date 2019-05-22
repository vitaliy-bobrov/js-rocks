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

  @ViewChild(CdkDrag)
  drag: CdkDrag;

  effect: Reverb;

  params: ReverbSettings = {
    level: 0.6,
    tone: 0.4,
    time: 3,
    active: false,
    type: 'Room'
  };

  types: SwitchOption[] = [
    {
      label: 'Spring',
      value: 'Direct Cabinet N3.wav'
    },
    {
      label: 'Plate',
      value: 'Chateau de Logne, Outside.wav'
    },
    {
      label: 'Hall',
      value: 'Scala Milan Opera Hall.wav'
    },
    {
      label: 'Room',
      value: 'Highly Damped Large Room.wav'
    },
    {
      label: 'Space',
      value: 'Deep Space.wav'
    }
  ];
  selectedType = this.types[3];

  constructor(
    private manager: AudioContextManager,
    private convolverService: ConvolverService) {}

  ngOnInit() {
    this.selectedType = this.typeByLabel(this.params.type);
    const convolver = this.convolverService.loadIR(this.manager.context, this.selectedType.value);
    this.effect = new Reverb(this.manager.context, 'jrv-6', convolver, this.params);
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }

  switchType(path: string) {
    this.selectedType = this.typeByValue(path);
    const convolver = this.convolverService.loadIR(this.manager.context, path);
    this.effect.updateConvolver(convolver, this.selectedType.label);
  }

  private typeByLabel(label: string): SwitchOption {
    const item =  this.types.find((type) => type.label === label);
    return item || this.types[3];
  }

  private typeByValue(value: string): SwitchOption {
    const item =  this.types.find((type) => type.value === value);
    return item || this.types[3];
  }
}

