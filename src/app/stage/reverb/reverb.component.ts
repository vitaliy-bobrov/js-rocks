import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  NgModule,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

import { AudioContextManager } from '@audio/audio-context-manager.service';
import { ConvolverService } from '@audio/convolver.service';
import { ReverbSettings, Reverb } from '@audio/effects/reverb';
import { PedalComponent, PedalDescriptor } from '../pedal.interface';
import {
  SwitchOption,
  SlideSwitchModule
} from '../slide-switch/slide-switch.component';
import { KnobModule } from '../knob/knob.component';
import { LargeSwitchModule } from '../large-switch/large-switch.component';
import { LedModule } from '../led/led.component';
import { StompboxModule } from '../stompbox/stompbox.component';

interface ReverbConvolver extends SwitchOption {
  gain: number;
}

@Component({
  selector: 'jsr-reverb',
  templateUrl: './reverb.component.html',
  styleUrls: ['./reverb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReverbComponent
  implements OnInit, OnDestroy, PedalComponent<ReverbSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  destroy$ = new Subject<void>();

  effect: Reverb;

  params: ReverbSettings = {
    level: 0.6,
    tone: 0.75,
    time: 5,
    active: false,
    type: 'Hall'
  };

  info: PedalDescriptor;

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
    private convolverService: ConvolverService
  ) {}

  ngOnInit() {
    this.selectedType = this.typeByLabel(this.params.type);
    const buffer$ = this.convolverService.loadIR(
      this.manager.context,
      this.selectedType.value
    );
    this.effect = new Reverb(
      this.manager.context,
      this.info.id,
      buffer$,
      this.selectedType.gain,
      this.params
    );
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }

  switchType(path: string) {
    this.selectedType = this.typeByValue(path);
    const buffer$ = this.convolverService.loadIR(this.manager.context, path);
    this.effect.updateConvolver(
      buffer$,
      this.selectedType.gain,
      this.selectedType.label
    );
  }

  private typeByLabel(label: string) {
    const item = this.types.find(type => type.label === label);
    return item || this.types[2];
  }

  private typeByValue(value: string) {
    const item = this.types.find(type => type.value === value);
    return item || this.types[2];
  }
}

@NgModule({
  declarations: [ReverbComponent],
  bootstrap: [ReverbComponent],
  imports: [
    CommonModule,
    KnobModule,
    LargeSwitchModule,
    LedModule,
    SlideSwitchModule,
    StompboxModule
  ]
})
export class ReverbModule {}
