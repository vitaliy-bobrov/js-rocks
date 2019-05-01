import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ComponentFactoryResolver,
  OnInit,
  OnDestroy,
  ViewRef,
  Renderer2 } from '@angular/core';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { take } from 'rxjs/operators';
import { Effect } from '@audio/effects/effect';
import { PedalBoardDirective } from '../pedalboard/pedalboard.directive';
import { Pedal, PedalComponent } from '../pedal.interface';
import { BluesDriverComponent } from '../blues-driver/blues-driver.component';
import { OverdriveComponent } from '../overdrive/overdrive.component';
import { DsOneComponent } from '../ds-one/ds-one.component';
import { PresetManagerService, Preset, PresetInfo } from '@audio/preset-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { PresetNameDialogComponent } from '../preset-name-dialog/preset-name-dialog.component';
import { ReverbComponent } from '../reverb/reverb.component';

const componentMapping = {
  'jds-1': {
    symbol: DsOneComponent,
    name: 'Classic Dist JDS-1'
  },
  'jbd-2': {
    symbol: BluesDriverComponent,
    name: 'Blues Rules JBD-2'
  },
  'jod-3': {
    symbol: OverdriveComponent,
    name: 'Overdrive JOD-3'
  },
  'jrv-6': {
    symbol: ReverbComponent,
    name: 'Reverb JRV-6'
  }
};

@Component({
  selector: 'jsr-stage',
  templateUrl: './stage.component.html',
  styleUrls: ['./stage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageComponent implements OnInit, OnDestroy {
  isLinePlugged = false;
  config: Preset;
  selectedPresetId: string;
  presets: PresetInfo[];
  availablePedals = Object.keys(componentMapping).map(key => ({
    id: key,
    name: componentMapping[key].name
  }));
  private pedals: Pedal[];

  @ViewChild(PedalBoardDirective)
  pedalBoard: PedalBoardDirective;

  constructor(
    public dialog: MatDialog,
    private manager: AudioContextManager,
    private presetsManager: PresetManagerService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private renderer: Renderer2) {
    this.savePreset = this.savePreset.bind(this);
  }

  ngOnInit() {
    this.afterConfigChange();

    this.presets = this.presetsManager.getPresetsInfo();
  }

  ngOnDestroy() {
    this.presetsManager.setCurrentPreset(this.selectedPresetId);
  }

  toggleLineConnection() {
    this.isLinePlugged = !this.isLinePlugged;

    if (this.isLinePlugged) {
      this.manager.plugLineIn();
    } else {
      this.manager.unplugLineIn();
    }
  }

  dropPedal(event: CdkDragDrop<Effect[]>) {
    this.manager.moveEffect(event.previousIndex, event.currentIndex);
  }

  loadPedals() {
    const viewContainerRef = this.pedalBoard.viewContainerRef;
    viewContainerRef.clear();

    for (const pedal of this.pedals) {
      this.createPedal(pedal);
    }
  }

  openPresetNameDialog() {
    const dialogRef = this.dialog.open(PresetNameDialogComponent, {
      width: '250px',
      data: {name: ''}
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
    const preset = this.manager.takeSnapshot();

    if (this.selectedPresetId) {
      preset.id = this.selectedPresetId;
      this.presetsManager.updatePreset(preset);
    } else {
      const result = this.presetsManager.addPreset(preset, name);
      this.presets = result.presets;
      this.selectedPresetId = result.id;
      this.presetsManager.setCurrentPreset(result.id);
    }
  }

  deletePreset() {
    this.presets = this.presetsManager.removePreset(this.selectedPresetId);

    if (this.presets.length) {
      this.presetsManager.setCurrentPreset(this.presets[0].id);
    } else {
      this.presetsManager.setCurrentPreset('');
    }

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
      params: null
    };
    const pedal = new Pedal(componentMapping[id].symbol, null);

    this.createPedal(pedal);

    this.config.pedals.push(pedalInfo);
  }

  private removePedal(pedalViewRef: ViewRef) {
    const viewContainerRef = this.pedalBoard.viewContainerRef;
    const index = viewContainerRef.indexOf(pedalViewRef);
    viewContainerRef.remove(index);
    this.config.pedals.splice(index, 1);
  }

  private createPedal(pedal: Pedal) {
    const viewContainerRef = this.pedalBoard.viewContainerRef;
    const componentFactory = this.componentFactoryResolver
        .resolveComponentFactory(pedal.component);
    const componentRef = viewContainerRef.createComponent(componentFactory);
    const component = componentRef.instance as PedalComponent<any>;

    component.remove.pipe(take(1)).subscribe(() => this.removePedal(componentRef.hostView));

    if (pedal.params) {
      component.params = pedal.params;
    }
  }

  private afterConfigChange() {
    this.config = this.presetsManager.getCurrentPreset();
    this.config.cabinet = {...this.config.cabinet};

    this.selectedPresetId = this.config.id;
    this.pedals = this.config.pedals
      .map(item =>  new Pedal(componentMapping[item.model].symbol, item.params));

    this.loadPedals();
  }
}
