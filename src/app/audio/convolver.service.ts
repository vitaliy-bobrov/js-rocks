import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ConvolverService {
  private irPath = 'assets/impulses';

  constructor(private http: HttpClient) {}

  loadIR(context: AudioContext, irFile: string): ConvolverNode {
    const convolver = context.createConvolver();
    const url = `${this.irPath}/${irFile}`;

    this.http.get(url, {responseType: 'arraybuffer'}).subscribe(res => {
      context.decodeAudioData(res, buffer => {
        convolver.buffer = buffer;
      });
    });

    return convolver;
  }
}
