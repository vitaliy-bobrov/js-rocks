import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  ViewChild,
  ComponentFactoryResolver,
  OnInit,
  OnDestroy,
  ViewRef,
  AfterContentChecked
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
import { PedalBoardDirective } from '../pedalboard/pedalboard.directive';
import { Pedal, PedalComponent, PedalDescriptor } from '../pedal.interface';
import { BluesDriverComponent } from '../blues-driver/blues-driver.component';
import { OverdriveComponent } from '../overdrive/overdrive.component';
import { DsOneComponent } from '../ds-one/ds-one.component';
import { PresetNameDialogComponent } from '../preset-name-dialog/preset-name-dialog.component';
import { ReverbComponent } from '../reverb/reverb.component';
import { LemonSqueezeComponent } from '../lemon-squeeze/lemon-squeeze.component';
import { MetalAreaComponent } from '../metal-area/metal-area.component';
import { CoolChorusComponent } from '../cool-chorus/cool-chorus.component';
import { MassiveMuffPiComponent } from '../massive-muff-pi/massive-muff-pi.component';
import { TremoloComponent } from '../tremolo/tremolo.component';

const componentMapping = {
  'jcp-1': {
    symbol: LemonSqueezeComponent,
    name: 'Lemon Squeeze',
    model: 'JCP-1'
  },
  'jds-1': {
    symbol: DsOneComponent,
    name: 'Classic Distortion',
    model: 'JDS-1'
  },
  'jmt-2': {
    symbol: MetalAreaComponent,
    name: 'Metal Area',
    model: 'JMT-2'
  },
  'jbd-2': {
    symbol: BluesDriverComponent,
    name: 'Blues Driver',
    model: 'JBD-2'
  },
  'jod-3': {
    symbol: OverdriveComponent,
    name: 'OverDrive',
    model: 'JOD-3'
  },
  'js-bmf': {
    symbol: MassiveMuffPiComponent,
    name: 'Massive Muff π',
    model: 'JS-BMF'
  },
  'jch-1': {
    symbol: CoolChorusComponent,
    name: 'Cool Chorus',
    model: 'JCH-1'
  },
  'jtr-2': {
    symbol: TremoloComponent,
    name: 'Tremolo',
    model: 'JTR-2'
  },
  'jrv-6': {
    symbol: ReverbComponent,
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
  presets: PresetInfo[];
  availablePedals: PedalDescriptor[] = Object.keys(componentMapping).map(
    key => ({
      id: key,
      name: componentMapping[key].name,
      model: componentMapping[key].model
    })
  );
  pedals: Pedal[];
  private dragRefs: CdkDrag[];
  private presetKeyMap: string[] = [''];

  @ViewChild(PedalBoardDirective, { static: true })
  pedalBoard: PedalBoardDirective;

  @ViewChild(CdkDropList, { static: true })
  dropList: CdkDropList;

  constructor(
    public dialog: MatDialog,
    private manager: AudioContextManager,
    private presetsManager: PresetManagerService,
    private componentFactoryResolver: ComponentFactoryResolver
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
    for (let i = 0; i < this.pedals.length; i++) {
      this.pedals[i].params = currentState[i].params;
    }

    moveItemInArray(this.pedals, event.previousIndex, event.currentIndex);
    this.loadPedals();
  }

  loadPedals() {
    const viewContainerRef = this.pedalBoard.viewContainerRef;
    viewContainerRef.clear();
    this.dragRefs = [];

    for (const pedal of this.pedals) {
      this.createPedal(pedal);
    }
  }

  openPresetNameDialog() {
    const dialogRef = this.dialog.open(PresetNameDialogComponent, {
      width: '250px',
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
    this.presetsManager.setCurrentPreset('');
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
    const pedal = new Pedal(componentMapping[id].symbol, null);

    this.pedals.push(pedal);
    this.createPedal(pedal);
    this.config.pedals.push(pedalInfo);
  }

  private removePedal(pedalViewRef: ViewRef) {
    const viewContainerRef = this.pedalBoard.viewContainerRef;
    const index = viewContainerRef.indexOf(pedalViewRef);
    viewContainerRef.remove(index);
    this.pedals.splice(index, 1);
    this.config.pedals.splice(index, 1);
    this.dragRefs.splice(index, 1);
  }

  private createPedal(pedal: Pedal) {
    const viewContainerRef = this.pedalBoard.viewContainerRef;
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      pedal.component
    );
    const componentRef = viewContainerRef.createComponent(componentFactory);
    const component = componentRef.instance as PedalComponent<any>;

    component.remove
      .pipe(take(1))
      .subscribe(() => this.removePedal(componentRef.hostView));

    if (pedal.params) {
      component.params = pedal.params;
    }

    this.dragRefs.push(component.drag);
  }

  private afterConfigChange() {
    this.config = this.presetsManager.getCurrentPreset();
    this.config.cabinet = { ...this.config.cabinet };

    this.selectedPresetId = this.config.id;
    this.pedals = this.config.pedals.map(
      item => new Pedal(componentMapping[item.model].symbol, item.params)
    );

    this.loadPedals();
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
