import { NgModule } from '@angular/core';

import { PresetManagerService } from './preset-manager.service';
import { ConvolverService } from './convolver.service';
import { AudioContextManager } from './audio-context-manager.service';

@NgModule({
  providers: [AudioContextManager, ConvolverService, PresetManagerService]
})
export class AudioModule {}
