import { TestBed } from '@angular/core/testing';

import { PresetManagerService } from './preset-manager.service';

describe('PresetManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PresetManagerService = TestBed.inject(PresetManagerService);
    expect(service).toBeTruthy();
  });
});
