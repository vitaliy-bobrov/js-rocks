import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface WapData {
  url: string;
  symbol: string;
}

@Component({
  selector: 'jsr-wap-url-dialog',
  templateUrl: './wap-url-dialog.component.html',
  styleUrls: ['./wap-url-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WapUrlDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<WapUrlDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WapData) {}

  onCancel() {
    this.dialogRef.close();
  }
}
