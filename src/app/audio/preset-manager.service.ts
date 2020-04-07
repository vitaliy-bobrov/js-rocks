import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { nanoid } from 'nanoid';
import { EffectInfo } from './effects/effect';
import { CabinetInfo } from './effects/cabinet';
import { deepCopy } from '@audio/utils';

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
  static CURRENT_PRESET_KEY = 'jsr_current_preset';
  static PRESETS_KEY = 'jsr_presets';
  static defaultPreset: Preset = {
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

  constructor(private snackBar: MatSnackBar) {}

  generatePresetId() {
    return `jsr-preset-${nanoid(10)}`;
  }

  getPresetsInfo(): PresetInfo[] {
    const presets = localStorage.getItem(PresetManagerService.PRESETS_KEY);

    return presets ? JSON.parse(presets) : [];
  }

  setPresetsInfo(presets: PresetInfo[]) {
    localStorage.setItem(
      PresetManagerService.PRESETS_KEY,
      JSON.stringify(presets)
    );
  }

  getCurrentPreset(): Preset {
    const currentPresetId = localStorage.getItem(
      PresetManagerService.CURRENT_PRESET_KEY
    );

    if (!currentPresetId) {
      return deepCopy(PresetManagerService.defaultPreset);
    }

    const preset = localStorage.getItem(currentPresetId);

    return preset
      ? JSON.parse(preset)
      : deepCopy(PresetManagerService.defaultPreset);
  }

  setCurrentPreset(id: string) {
    localStorage.setItem(PresetManagerService.CURRENT_PRESET_KEY, id);
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
    localStorage.setItem(preset.id, JSON.stringify(preset));
    this.showToastNotification('Preset updated successfully!');
  }

  removePreset(id: string) {
    const presets = this.getPresetsInfo();
    const updated = presets.filter(preset => preset.id !== id);

    this.setPresetsInfo(updated);
    localStorage.removeItem(id);
    this.setCurrentPreset('');
    this.showToastNotification('Preset deleted successfully!');

    return updated;
  }

  private showToastNotification(notificationMessage: string) {
    this.snackBar.open(notificationMessage);
  }
}
