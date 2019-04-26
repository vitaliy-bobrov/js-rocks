import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ConvolverService {
  private irPath = '/assets/impulses';

  constructor(private http: HttpClient) {}

  loadIR(context: AudioContext, convolver: ConvolverNode, irFile: string) {
    const url = `${this.irPath}/${irFile}`;

    return this.http.get(url, {responseType: 'arraybuffer'}).subscribe(res => {
      context.decodeAudioData(res, buffer => convolver.buffer = buffer);
    });
  }
}
