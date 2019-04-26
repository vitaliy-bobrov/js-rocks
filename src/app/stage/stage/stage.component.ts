import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AudioContextManager } from '@audio/audio-context-manager.service';

@Component({
  selector: 'jsr-stage',
  templateUrl: './stage.component.html',
  styleUrls: ['./stage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageComponent {
  isLinePlugged = false;

  constructor(private manager: AudioContextManager) {}

  toggleLineConnection() {
    this.isLinePlugged = !this.isLinePlugged;

    if (this.isLinePlugged) {
      this.manager.plugLineIn();
    } else {
      this.manager.unplugLineIn();
    }
  }
}
