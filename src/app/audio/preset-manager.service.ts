import { Injectable } from '@angular/core';
import * as nanoid from 'nanoid';
import { EffectInfo } from './effects/effect';
import { CabinetInfo } from './effects/cabinet';
import { deepCopy } from '../utils';

export interface Preset {
  id?: string;
  cabinet: CabinetInfo;
  pedals: EffectInfo[];
}

export interface PresetInfo {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PresetManagerService {
  static CURRENT_PRESET_KEY = 'jsr_current_preset';
  static PRESETS_KEY = 'jsr_presets';
  static defaultPreset: Preset = {
    id: '',
    cabinet: {
      model: 'Captain 1960',
      params: {
        volume: 1,
        bass: 0.45,
        mid: 0.6,
        treble: 0.5,
        gain: 4,
        active: true
      },
    },
    pedals: [
      {
        model: 'jcp-1',
        params: null
      },
      {
        model: 'jbd-2',
        params: null
      },
      {
        model: 'jch-1',
        params: null
      },
      {
        model: 'jrv-6',
        params: null
      }
    ]
  };

  generatePresetId() {
    return `jsr-preset-${nanoid(10)}`;
  }

  getPresetsInfo(): PresetInfo[] {
    const presets = localStorage
      .getItem(PresetManagerService.PRESETS_KEY);

    return presets ? JSON.parse(presets) : [];
  }

  setPresetsInfo(presets: PresetInfo[]) {
    localStorage.setItem(PresetManagerService.PRESETS_KEY, JSON.stringify(presets));
  }

  getCurrentPreset(): Preset {
    const currentPresetId = localStorage
      .getItem(PresetManagerService.CURRENT_PRESET_KEY);

    if (!currentPresetId) {
      return deepCopy(PresetManagerService.defaultPreset);
    }

    const preset = localStorage.getItem(currentPresetId);

    return preset ? JSON.parse(preset) : deepCopy(PresetManagerService.defaultPreset);
  }

  setCurrentPreset(id: string) {
    localStorage.setItem(PresetManagerService.CURRENT_PRESET_KEY, id);
  }

  addPreset(preset: Preset, name: string): {presets: PresetInfo[], id: string} {
    const presets = this.getPresetsInfo();
    const id = this.generatePresetId();
    preset.id = id;
    presets.push({
      id,
      name
    });

    this.setPresetsInfo(presets);
    this.updatePreset(preset);

    return {presets, id};
  }

  updatePreset(preset: Preset) {
    localStorage.setItem(preset.id, JSON.stringify(preset));
  }

  removePreset(id: string): PresetInfo[] {
    const presets = this.getPresetsInfo();
    const updated = presets.filter(preset => preset.id !== id);

    this.setPresetsInfo(updated);
    localStorage.removeItem(id);

    return presets;
  }
}
