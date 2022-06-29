import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { nanoid } from 'nanoid';
import { EffectInfo } from './effects/effect';
import { CabinetInfo } from './effects/cabinet';
import { deepCopy } from '@audio/utils';
import { LocalStorageService } from '@shared/storage/local-storage.service';

export interface Preset {
  id?: string;
  cabinet: CabinetInfo;
  pedals: EffectInfo[];
}

export interface PresetInfo {
  id: string;
  name: string;
}

@Injectable()
export class PresetManagerService {
  static readonly CURRENT_PRESET_KEY = 'jsr_current_preset';
  static readonly PRESETS_KEY = 'jsr_presets';
  static readonly defaultPreset: Preset = {
    id: '',
    cabinet: {
      model: 'Captain 1960',
      params: {
        volume: 1,
        bass: 0,
        mid: 0,
        treble: 0,
        gain: 4,
        active: true
      }
    },
    pedals: []
  };

  constructor(
    private snackBar: MatSnackBar,
    private storage: LocalStorageService
  ) {}

  generatePresetId(): string {
    return `jsr-preset-${nanoid(10)}`;
  }

  getPresetsInfo(): PresetInfo[] {
    const presets = this.storage.getItem(PresetManagerService.PRESETS_KEY);

    return presets ? JSON.parse(presets) : [];
  }

  setPresetsInfo(presets: PresetInfo[]) {
    this.storage.setItem(PresetManagerService.PRESETS_KEY, presets);
  }

  getCurrentPreset(): Preset {
    const currentPresetId = this.storage.getItem(
      PresetManagerService.CURRENT_PRESET_KEY
    );

    if (!currentPresetId) {
      return deepCopy(PresetManagerService.defaultPreset);
    }

    const preset = this.storage.getItem(currentPresetId);

    return preset
      ? JSON.parse(preset)
      : deepCopy(PresetManagerService.defaultPreset);
  }

  setCurrentPreset(id: string) {
    this.storage.setItem(PresetManagerService.CURRENT_PRESET_KEY, id);
  }

  addPreset(preset: Preset, name: string) {
    const presets = this.getPresetsInfo();
    const id = this.generatePresetId();

    // Check for id collisions.
    if (presets.some(item => item.id === id)) {
      this.addPreset(preset, name);
    }

    preset.id = id;
    presets.push({
      id,
      name
    });

    this.setPresetsInfo(presets);
    this.updatePreset(preset);
    this.showToastNotification('New preset added successfully!');

    return { presets, id };
  }

  updatePreset(preset: Preset) {
    this.storage.setItem(preset.id, preset);
    this.showToastNotification('Preset updated successfully!');
  }

  removePreset(id: string) {
    const presets = this.getPresetsInfo();
    const updated = presets.filter(preset => preset.id !== id);

    this.setPresetsInfo(updated);
    this.storage.removeItem(id);
    this.setCurrentPreset('');
    this.showToastNotification('Preset deleted successfully!');

    return updated;
  }

  private showToastNotification(notificationMessage: string) {
    this.snackBar.open(notificationMessage);
  }
}
