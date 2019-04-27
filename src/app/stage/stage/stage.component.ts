import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ComponentFactoryResolver,
  OnInit } from '@angular/core';
import { AudioContextManager } from '@audio/audio-context-manager.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Effect } from '@audio/effects/effect';
import { PedalBoardDirective } from '../pedalboard/pedalboard.directive';
import { Pedal, PedalComponent } from '../pedal.interface';
import { BluesDriverComponent } from '../blues-driver/blues-driver.component';
import { OverdriveComponent } from '../overdrive/overdrive.component';
import { DsOneComponent } from '../ds-one/ds-one.component';

const componentMapping = {
  'jds-1': DsOneComponent,
  'jbd-2': BluesDriverComponent,
  'jod-3': OverdriveComponent
};

@Component({
  selector: 'jsr-stage',
  templateUrl: './stage.component.html',
  styleUrls: ['./stage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageComponent implements OnInit {
  config = {
    cabinet: {
      model: 'MegaStorm',
      params: {
        volume: 1,
        bass: 0.5,
        mid: 0.5,
        treble: 0.5,
        active: true
      },
    },
    pedals: [
      {
        model: 'jod-3',
        params: null
      },
      {
        model: 'jbd-2',
        params: null
      },
      {
        model: 'jds-1',
        params: null
      }
    ]
  };
  isLinePlugged = false;
  pedals: Pedal[];

  @ViewChild(PedalBoardDirective)
  pedalBoard: PedalBoardDirective;

  constructor(
    private manager: AudioContextManager,
    private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {
    this.pedals = this.config.pedals
      .map(item =>  new Pedal(componentMapping[item.model], item.params));

    this.loadPedals();
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
      const componentFactory = this.componentFactoryResolver
        .resolveComponentFactory(pedal.component);
      const componentRef = viewContainerRef.createComponent(componentFactory);
      if (pedal.params) {
        (componentRef.instance as PedalComponent<any>).params = pedal.params;
      }
    }
  }
}
