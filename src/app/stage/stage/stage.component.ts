import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  OnInit,
  OnDestroy,
  ComponentRef
} from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { NgsgOrderChange } from 'ng-sortgrid';

import { AudioContextManager } from '@audio/audio-context-manager.service';
import {
  PresetManagerService,
  Preset,
  PresetInfo
} from '@audio/preset-manager.service';
import { EffectInfo } from '@audio/effects/effect';
import { PedalComponent, PedalDescriptor } from '../pedal.interface';
import { PresetNameDialogComponent } from '../preset-name-dialog/preset-name-dialog.component';
import { MatSelectChange } from '@angular/material/select';
import { AudioIO } from '@audio/interfaces/audio-io.interface';

@Component({
  selector: 'jsr-stage',
  templateUrl: './stage.component.html',
  styleUrls: ['./stage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageComponent implements OnInit, OnDestroy {
  /**
   * Whether the audio stream source is currently active.
   */
  isLinePlugged = false;

  /**
   * Current stage amp and pedals configurations.
   */
  config: Preset;

  /**
   * Currently selected preset id, empty for default preset.
   */
  selectedPresetId: string;

  /**
   * Previously saved user presets.
   */
  presets: PresetInfo[] = [];

  activeInputDevice$ = this.manager.input$;
  activeOutputDevice$ = this.manager.output$;

  get inputDevices(): AudioIO[] {
    return this.manager.inputDevices;
  }

  get outputDevices(): AudioIO[] {
    return this.manager.outputDevices;
  }

  /**
   * Effect types used to group pedals.
   */
  readonly effectTypes = [
    'Tuner',
    'Compressor',
    'Overdrive',
    'Distortion',
    'Fuzz',
    'Chorus',
    'Phaser',
    'Tremolo',
    'Delay',
    'Reverb'
  ];

  /**
   * All available pedals meta data.
   */
  readonly availablePedals: PedalDescriptor[] = [
    {
      id: 'jtu-3',
      type: 'Tuner',
      brand: 'JOSS',
      name: 'Tuner',
      model: 'JTU-3'
    },
    {
      id: 'jcp-1',
      type: 'Compressor',
      brand: 'JOSS',
      name: 'Lemon Squeeze',
      model: 'JCP-1'
    },
    {
      id: 'jbd-2',
      type: 'Overdrive',
      brand: 'JOSS',
      name: 'Blues Driver',
      model: 'JBD-2'
    },
    {
      id: 'jod-3',
      type: 'Overdrive',
      brand: 'JOSS',
      name: 'OverDrive',
      model: 'JOD-3'
    },
    {
      id: 'jds-1',
      type: 'Distortion',
      brand: 'JOSS',
      name: 'Classic Distortion',
      model: 'JDS-1'
    },
    {
      id: 'jmt-2',
      type: 'Distortion',
      brand: 'JOSS',
      name: 'Metal Area',
      model: 'JMT-2'
    },
    {
      id: 'js-bmf',
      type: 'Fuzz',
      brand: 'Ernesto-Saxophonist',
      name: 'Massive Muff π'
    },
    {
      id: 'jch-1',
      type: 'Chorus',
      brand: 'JOSS',
      name: 'Cool Chorus',
      model: 'JCH-1'
    },
    {
      id: 'js-phase-pi-by-2',
      type: 'Phaser',
      brand: 'TSX',
      name: 'phase π/2'
    },
    {
      id: 'jtr-2',
      type: 'Tremolo',
      brand: 'JOSS',
      name: 'Tremolo',
      model: 'JTR-2'
    },
    {
      id: 'soft-yellow-tremolo',
      type: 'Tremolo',
      brand: 'Crazy Doctor',
      name: 'Soft Yellow Tremolo'
    },
    {
      id: 'jdm-2',
      type: 'Delay',
      brand: 'JOSS',
      name: 'Delay',
      model: 'JDM-2'
    },
    {
      id: 'jrv-6',
      type: 'Reverb',
      brand: 'JOSS',
      name: 'Reverb',
      model: 'JRV-6'
    }
  ];
  private presetKeyMap: string[] = [''];

  constructor(
    public dialog: MatDialog,
    private manager: AudioContextManager,
    private presetsManager: PresetManagerService
  ) {
    this.savePreset = this.savePreset.bind(this);
  }

  ngOnInit(): void {
    this.presets = this.presetsManager.getPresetsInfo();
    this.afterConfigChange();
    this.updatePresetsKeyMap();
  }

  ngOnDestroy(): void {
    this.presetsManager.setCurrentPreset(this.selectedPresetId);
  }

  /**
   * Updates input audio device.
   */
  handleInputDeviceChange(event: MatSelectChange): void {
    this.manager.changeInputDevice(event.value);
  }

  /**
   * Updates output audio device.
   */
  handleOutputDeviceChange(event: MatSelectChange): void {
    this.manager.changeOutputDevice(event.value);
  }

  @HostListener('window:keyup', ['$event'])
  handlePresetShortcut(event: KeyboardEvent): void {
    const id = this.presetKeyMap[event.key];

    if (
      typeof id === 'undefined' ||
      (event.target as HTMLElement).nodeName.toLowerCase() === 'input'
    ) {
      return;
    }

    this.activatePreset(id);
  }

  /**
   * Updates connect button and audio stream states.
   */
  toggleLineConnection(): void {
    this.isLinePlugged = !this.isLinePlugged;

    if (this.isLinePlugged) {
      this.manager.plugLineIn();
    } else {
      this.manager.unplugLineIn();
    }
  }

  /**
   * Reordering pedals on DnD interactions.
   */
  dropPedal(event: NgsgOrderChange<EffectInfo>, pedal: EffectInfo): void {
    const previousIndex = event.previousOrder.indexOf(pedal);
    const currentIndex = event.currentOrder.indexOf(pedal);
    moveItemInArray(this.config.pedals, previousIndex, currentIndex);
    this.manager.moveEffect(previousIndex, currentIndex);
  }

  /**
   * Opens a dialog to define a new preset name.
   */
  openPresetNameDialog(): void {
    const dialogRef = this.dialog.open(PresetNameDialogComponent, {
      width: '320px',
      data: { name: '' }
    });

    dialogRef.afterClosed().subscribe(this.savePreset);
  }

  requestSavePreset(): void {
    if (this.selectedPresetId) {
      this.savePreset();
    } else {
      this.openPresetNameDialog();
    }
  }

  /**
   * Saves preset to the storage.
   */
  savePreset(name?: string): void {
    if (!name && !this.selectedPresetId) {
      return;
    }

    const preset = this.manager.takeSnapshot();

    if (this.selectedPresetId) {
      preset.id = this.selectedPresetId;
      this.presetsManager.updatePreset(preset);
    } else {
      const result = this.presetsManager.addPreset(preset, name);
      this.presets = result.presets;
      this.selectedPresetId = result.id;
      this.presetsManager.setCurrentPreset(result.id);
      this.updatePresetsKeyMap();
    }
  }

  deletePreset(): void {
    this.presets = this.presetsManager.removePreset(this.selectedPresetId);
    this.updatePresetsKeyMap();
    this.afterConfigChange();
  }

  blankPreset(): void {
    this.selectedPresetId = '';
    this.presetsManager.setCurrentPreset('');
    this.afterConfigChange();
  }

  activatePreset(id: string): void {
    this.selectedPresetId = id;
    this.presetsManager.setCurrentPreset(id);
    this.afterConfigChange();
  }

  addPedal(id: string): void {
    const pedalInfo = {
      model: id,
      params: null as null
    };

    this.config.pedals.push(pedalInfo);
  }

  initPedal(
    componentRef: ComponentRef<PedalComponent<unknown>>,
    pedal: EffectInfo,
    id: string
  ): void {
    const component = componentRef.instance;

    component.remove
      .pipe(takeUntil(component.destroy$))
      .subscribe(() => this.removePedal(componentRef, pedal));

    component.info = this.availablePedals.find(
      descriptor => descriptor.id === id
    );

    if (pedal.params) {
      component.params = pedal.params;
    }
  }

  private removePedal(
    componentRef: ComponentRef<PedalComponent<unknown>>,
    pedal: EffectInfo
  ): void {
    this.config.pedals = this.config.pedals.filter(config => config !== pedal);
    componentRef.destroy();
  }

  private afterConfigChange(): void {
    this.config = this.presetsManager.getCurrentPreset();
    this.config.cabinet = { ...this.config.cabinet };
    this.selectedPresetId = this.config.id;
  }

  private updatePresetsKeyMap(): void {
    this.presetKeyMap = this.presets.reduce(
      (map, preset) => {
        map.push(preset.id);

        return map;
      },
      ['']
    );
  }
}
