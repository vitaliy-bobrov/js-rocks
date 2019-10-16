import { NgModule } from '@angular/core';
import { PortalModule } from '@angular/cdk/portal';
import { PageActionsComponent } from './page-actions/page-actions.component';
import { ValueLabelPipe } from './pipes/value-label.pipe';
import { StringPipe } from './pipes/string.pipe';

@NgModule({
  declarations: [PageActionsComponent, ValueLabelPipe, StringPipe],
  imports: [PortalModule],
  exports: [PageActionsComponent, PortalModule, ValueLabelPipe, StringPipe]
})
export class SharedModule {}
