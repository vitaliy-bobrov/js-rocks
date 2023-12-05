import {ChangeDetectionStrategy,
Component,
ElementRef,
EventEmitter,
HostBinding,
NgModule,
OnDestroy,
OnInit,
Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

import { AudioContextManager } from '@audio/audio-context-manager.service';
import { Effect } from '@audio/effects/effect';
import { PedalComponent, PedalDescriptor } from '../pedal.interface';

@Component({
  selector: 'jsr-dynamic-pedal',
  template: '',
  styleUrls: ['./dynamic-pedal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicPedalComponent implements OnInit, OnDestroy, PedalComponent<unknown> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  destroy$ = new Subject<void>();

  effect: Effect<any>;

  params: unknown = {
    active: false
  };

  info: PedalDescriptor;

  constructor(private manager: AudioContextManager, private element: ElementRef) {}

  ngOnInit() {
    // load WAP, load UI, add to manager, fullfil descriptor, assign params.

    this.manager.addWapEffect(this.info.url, this.info.symbol).then(data => {
      this.effect = data.node;
      this.element.nativeElement.appendChild(data.pluginUI);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.manager.removeEffect(this.effect);
  }
}

@NgModule({
  declarations: [DynamicPedalComponent],
  bootstrap: [DynamicPedalComponent],
  imports: [
    CommonModule,
  ]
})
export class DynamicPedalModule {}
