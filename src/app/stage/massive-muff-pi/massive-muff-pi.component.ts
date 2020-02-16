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

import { Muff, MuffSettings } from '@audio/effects/muff';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent, PedalDescriptor } from '../pedal.interface';
import { KnobModule } from '../knob/knob.component';
import { SmallSwitchModule } from '../small-switch/small-switch.component';
import { StompboxModule } from '../stompbox/stompbox.component';

@Component({
  selector: 'jsr-massive-muff-pi',
  templateUrl: './massive-muff-pi.component.html',
  styleUrls: ['./massive-muff-pi.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MassiveMuffPiComponent
  implements OnInit, OnDestroy, PedalComponent<MuffSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  destroy$ = new Subject<void>();

  effect: Muff;

  params: MuffSettings = {
    level: 0.5,
    sustain: 0.5,
    tone: 0.5,
    active: false
  };

  info: PedalDescriptor;

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    // Config based on Big Muff Pi analysis https://www.electrosmash.com/big-muff-pi-analysis.
    this.effect = new Muff(this.manager.context, this.info.id, this.params, {
      curveType: 'arch',
      boost: 16.7,
      preFilterRange: [3.84, 1215.3],
      toneRange: [482.39, 1206.27],
      postFilterRanges: [55, 1780, 94, 1170]
    });
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}

@NgModule({
  declarations: [MassiveMuffPiComponent],
  bootstrap: [MassiveMuffPiComponent],
  imports: [CommonModule, KnobModule, SmallSwitchModule, StompboxModule]
})
export class MassiveMuffPiModule {}
