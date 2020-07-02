import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AudioContext, AudioBuffer } from 'standardized-audio-context';

@Injectable()
export class ConvolverService {
  private irPath = 'assets/impulses';

  constructor(private http: HttpClient) {}

  loadIR(context: AudioContext, irFile: string): Observable<AudioBuffer> {
    const url = `${this.irPath}/${irFile}`;

    return this.http.get(url, { responseType: 'arraybuffer' }).pipe(
      mergeMap(async res => {
        return new Promise<AudioBuffer>((resolve, reject) => {
          context.decodeAudioData(res, resolve, reject);
        });
      })
    );
  }
}
