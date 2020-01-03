import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { PresetManagerService } from './preset-manager.service';

describe('PresetManagerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [PresetManagerService]
    })
  );

  it('should be created', () => {
    const service: PresetManagerService = TestBed.inject(PresetManagerService);
    expect(service).toBeTruthy();
  });
});
