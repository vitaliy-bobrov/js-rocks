import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ConvolverService } from './convolver.service';
import { AudioContextManager } from './audio-context-manager.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [
    HttpClient,
    ConvolverService,
    AudioContextManager
  ]
})
export class AudioModule {}
