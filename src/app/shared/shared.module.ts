import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [MatIconModule],
  exports: [CommonModule, MatIconModule]
})
export class SharedModule {}
