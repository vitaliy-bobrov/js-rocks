import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterContentChecked,
  ComponentRef
} from '@angular/core';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';

import { AudioContextManager } from '@audio/audio-context-manager.service';
import {
  PresetManagerService,
  Preset,
  PresetInfo
} from '@audio/preset-manager.service';
import { Effect } from '@audio/effects/effect';
import { PedalComponent, PedalDescriptor } from '../pedal.interface';
import { PresetNameDialogComponent } from '../preset-name-dialog/preset-name-dialog.component';

@Component({
  selector: 'jsr-stage',
  templateUrl: './stage.component.html',
  styleUrls: ['./stage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageComponent implements OnInit, OnDestroy, AfterContentChecked {
  isLinePlugged = false;
  config: Preset;
  selectedPresetId: string;
  presets: PresetInfo[] = [];
  effectTypes = [
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
  availablePedals: PedalDescriptor[] = [
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
  private dragRefs: CdkDrag[];
  private presetKeyMap: string[] = [''];

  @ViewChild(CdkDropList, { static: true })
  dropList: CdkDropList;

  constructor(
    public dialog: MatDialog,
    private manager: AudioContextManager,
    private presetsManager: PresetManagerService
  ) {
    this.savePreset = this.savePreset.bind(this);
  }

  ngOnInit() {
    this.presets = this.presetsManager.getPresetsInfo();
    this.afterConfigChange();
    this.updatePresetsKeyMap();
  }

  ngOnDestroy() {
    this.presetsManager.setCurrentPreset(this.selectedPresetId);
  }

  ngAfterContentChecked() {
    this.initPedalsDrag();
  }

  @HostListener('window:keyup', ['$event'])
  handlePresetShortcut(event: KeyboardEvent) {
    const id = this.presetKeyMap[event.key];

    if (typeof id === 'undefined') {
      return;
    }

    this.activatePreset(id);
  }

  toggleLineConnection() {
    this.isLinePlugged = !this.isLinePlugged;

    if (this.isLinePlugged) {
      this.manager.plugLineIn();
    } else {
      this.manager.unplugLineIn();
    }
  }

  dropPedal(event: CdkDragDrop<Effect<any>[]>) {
    moveItemInArray(
      this.config.pedals,
      event.previousIndex,
      event.currentIndex
    );
    moveItemInArray(this.dragRefs, event.previousIndex, event.currentIndex);
    this.manager.moveEffect(event.previousIndex, event.currentIndex);
  }

  openPresetNameDialog() {
    const dialogRef = this.dialog.open(PresetNameDialogComponent, {
      width: '320px',
      data: { name: '' }
    });

    dialogRef.afterClosed().subscribe(this.savePreset);
  }

  requestSavePreset() {
    if (this.selectedPresetId) {
      this.savePreset();
    } else {
      this.openPresetNameDialog();
    }
  }

  savePreset(name?: string) {
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

  deletePreset() {
    this.presets = this.presetsManager.removePreset(this.selectedPresetId);
    this.updatePresetsKeyMap();
    this.afterConfigChange();
  }

  blankPreset() {
    this.selectedPresetId = '';
    this.presetsManager.setCurrentPreset('');
    this.afterConfigChange();
  }

  activatePreset(id: string) {
    this.selectedPresetId = id;
    this.presetsManager.setCurrentPreset(id);
    this.afterConfigChange();
  }

  addPedal(id: string) {
    const pedalInfo = {
      model: id,
      params: null as null
    };

    this.config.pedals.push(pedalInfo);
  }

  private removePedal(componentRef: ComponentRef<PedalComponent<unknown>>) {
    const index = this.dragRefs.indexOf(componentRef.instance.drag);
    this.config.pedals.splice(index, 1);
    this.dragRefs.splice(index, 1);
    componentRef.destroy();
  }

  initPedal(
    componentRef: ComponentRef<PedalComponent<unknown>>,
    params: unknown,
    id: string
  ) {
    const component = componentRef.instance;

    component.remove
      .pipe(takeUntil(component.destroy$))
      .subscribe(() => this.removePedal(componentRef));

    component.info = this.availablePedals.find(
      descriptor => descriptor.id === id
    );

    if (params) {
      component.params = params;
    }

    this.dragRefs.push(component.drag);
  }

  private afterConfigChange() {
    this.dragRefs = [];
    this.config = this.presetsManager.getCurrentPreset();
    this.config.cabinet = { ...this.config.cabinet };
    this.selectedPresetId = this.config.id;
  }

  private initPedalsDrag() {
    this.dropList._dropListRef.withItems(
      this.dragRefs.map(drag => drag._dragRef)
    );
  }

  private updatePresetsKeyMap() {
    this.presetKeyMap = this.presets.reduce(
      (map, preset) => {
        map.push(preset.id);

        return map;
      },
      ['']
    );
  }
}
