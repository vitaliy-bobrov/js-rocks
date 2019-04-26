import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { Cabinet } from '@audio/effects/cabinet';
import { ConvolverService } from '@audio/convolver.service';

@Component({
  selector: 'jsr-amp',
  templateUrl: './amp.component.html',
  styleUrls: ['./amp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmpComponent implements OnInit, OnDestroy {
  effect: Cabinet;
  masterVolume$ = this.manager.master$;

  constructor(
    private manager: AudioContextManager,
    private convolverService: ConvolverService
  ) {}

  ngOnInit() {
    this.effect = new Cabinet(this.manager.context);
    this.manager.addEffect(this.effect);
    this.convolverService.loadIR(this.manager.context, this.effect.convolver, 'little_screamer.ogg');
  }

  ngOnDestroy() {
    this.effect.dispose();
  }

  updateMasterVolume(value: number) {
    this.manager.master = value;
  }
}
