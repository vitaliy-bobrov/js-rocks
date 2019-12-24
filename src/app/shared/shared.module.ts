import { NgModule } from '@angular/core';
import { PortalModule } from '@angular/cdk/portal';
import { PageActionsComponent } from './page-actions/page-actions.component';
import { ValueLabelPipe } from './pipes/value-label.pipe';
import { BitMaskPipe } from './pipes/bit-mask.pipe';

@NgModule({
  declarations: [PageActionsComponent, ValueLabelPipe, BitMaskPipe],
  imports: [PortalModule],
  exports: [BitMaskPipe, PageActionsComponent, PortalModule, ValueLabelPipe]
})
export class SharedModule {}
