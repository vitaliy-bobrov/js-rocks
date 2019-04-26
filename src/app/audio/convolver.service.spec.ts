import { TestBed } from '@angular/core/testing';

import { ConvolverService } from './convolver.service';

describe('ConvolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConvolverService = TestBed.get(ConvolverService);
    expect(service).toBeTruthy();
  });
});
