import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  name: string;
}

@Component({
  selector: 'jsr-preset-name-dialog',
  templateUrl: './preset-name-dialog.component.html',
  styleUrls: ['./preset-name-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresetNameDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PresetNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onCancel() {
    this.dialogRef.close();
  }
}
