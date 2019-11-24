import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output
} from '@angular/core';

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
