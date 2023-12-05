import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  NgModule,
  Output
} from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'jsr-stompbox',
  templateUrl: './stompbox.component.html',
  styleUrls: ['./stompbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StompboxComponent {
  @Output()
  remove = new EventEmitter<void>();
}

@NgModule({
  declarations: [StompboxComponent],
  imports: [MatButtonModule, MatIconModule],
  exports: [StompboxComponent]
})
export class StompboxModule {}
