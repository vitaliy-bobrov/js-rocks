import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Distortion, DistortionSettings } from '@audio/effects/distortion';
import { AudioContextManager } from '@audio/audio-context-manager.service';

@Component({
  selector: 'jsr-blues-driver',
  templateUrl: './blues-driver.component.html',
  styleUrls: ['./blues-driver.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BluesDriverComponent implements OnInit, OnDestroy {
  effect: Distortion;

  defaults: DistortionSettings = {
    level: 0.5,
    distortion: 0.4,
    tone: 0.2,
    oversample: '4x'
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Distortion(this.manager.context, this.defaults, 'blues')
      .withPreFilter(this.manager.context);
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.effect.dispose();
  }
}

