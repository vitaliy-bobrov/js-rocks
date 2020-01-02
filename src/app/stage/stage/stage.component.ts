import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  ViewChild,
  OnInit,
  OnDestroy,
  ViewRef,
  AfterContentChecked,
  ViewContainerRef,
  Type,
  ComponentRef
} from '@angular/core';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { AudioContextManager } from '@audio/audio-context-manager.service';
import {
  PresetManagerService,
  Preset,
  PresetInfo
} from '@audio/preset-manager.service';
import { Effect } from '@audio/effects/effect';
import { PedalComponent, PedalDescriptor } from '../pedal.interface';
import { PresetNameDialogComponent } from '../preset-name-dialog/preset-name-dialog.component';

const componentMapping = {
  'jtu-3': {
    name: 'Tuner',
    model: 'JTU-3'
  },
  'jcp-1': {
    name: 'Lemon Squeeze',
    model: 'JCP-1'
  },
  'jbd-2': {
    name: 'Blues Driver',
    model: 'JBD-2'
  },
  'jod-3': {
    name: 'OverDrive',
    model: 'JOD-3'
  },
  'jds-1': {
    name: 'Classic Distortion',
    model: 'JDS-1'
  },
  'jmt-2': {
    name: 'Metal Area',
    model: 'JMT-2'
  },
  'js-bmf': {
    name: 'Massive Muff π',
    model: 'JS-BMF'
  },
  'jch-1': {
    name: 'Cool Chorus',
    model: 'JCH-1'
  },
  'jtr-2': {
    name: 'Tremolo',
    model: 'JTR-2'
  },
  'jrv-6': {
    name: 'Reverb',
    model: 'JRV-6'
  }
};

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
  availablePedals: PedalDescriptor[] = Object.keys(componentMapping).map(
    key => ({
      id: key,
      name: componentMapping[key].name,
      model: componentMapping[key].model
    })
  );
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
    const currentState = this.manager.takeSnapshot().pedals;

    // Save current configurations.
    for (let i = 0; i < this.config.pedals.length; i++) {
      this.config.pedals[i].params = currentState[i].params;
    }

    moveItemInArray(
      this.config.pedals,
      event.previousIndex,
      event.currentIndex
    );
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
    params: unknown
  ) {
    const component = componentRef.instance;

    component.remove
      .pipe(take(1))
      .subscribe(() => this.removePedal(componentRef));

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
