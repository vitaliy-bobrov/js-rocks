import { TestBed } from '@angular/core/testing';

import { AudioContextManager } from './audio-context-manager.service';

xdescribe('AudioContextManager', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AudioContextManager = TestBed.inject(AudioContextManager);
    expect(service).toBeTruthy();
  });
});
