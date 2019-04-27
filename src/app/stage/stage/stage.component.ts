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
import { Pedal } from '../pedal.interface';
import { BluesDriverComponent } from '../blues-driver/blues-driver.component';
import { OverdriveComponent } from '../overdrive/overdrive.component';
import { DsOneComponent } from '../ds-one/ds-one.component';

@Component({
  selector: 'jsr-stage',
  templateUrl: './stage.component.html',
  styleUrls: ['./stage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageComponent implements OnInit {
  isLinePlugged = false;
  pedals: Pedal[];

  @ViewChild(PedalBoardDirective)
  pedalBoard: PedalBoardDirective;

  constructor(
    private manager: AudioContextManager,
    private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {
    this.pedals = [
      new Pedal(BluesDriverComponent),
      new Pedal(OverdriveComponent),
      new Pedal(DsOneComponent)
    ];

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
      viewContainerRef.createComponent(componentFactory);
    }
  }
}
