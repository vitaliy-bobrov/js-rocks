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
import { Compressor, CompressorSettings } from '@audio/effects/compressor';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { PedalComponent } from '../pedal.interface';

@Component({
  selector: 'jsr-lemon-squeeze',
  templateUrl: './lemon-squeeze.component.html',
  styleUrls: ['./lemon-squeeze.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LemonSqueezeComponent implements OnInit, OnDestroy, PedalComponent<CompressorSettings> {
  @HostBinding('class.pedal')
  pedalClassName = true;

  @Output()
  remove = new EventEmitter<void>();

  @ViewChild(CdkDrag, { static: true })
  drag: CdkDrag;

  effect: Compressor;

  params: CompressorSettings = {
    level: 0.6,
    attack: 0.15,
    ratio: 12,
    threshold: 0.5,
    active: false
  };

  constructor(private manager: AudioContextManager) {}

  ngOnInit() {
    this.effect = new Compressor(this.manager.context, 'jcp-1', this.params);
    this.manager.addEffect(this.effect);
  }

  ngOnDestroy() {
    this.manager.removeEffect(this.effect);
    this.effect.dispose();
  }
}
