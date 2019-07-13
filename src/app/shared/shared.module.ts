import { NgModule } from '@angular/core';
import { PortalModule } from '@angular/cdk/portal';
import { PageActionsComponent } from './page-actions/page-actions.component';
import { ValueLabelPipe } from './value-label.pipe';

@NgModule({
  declarations: [
    PageActionsComponent,
    ValueLabelPipe
  ],
  imports: [
    PortalModule
  ],
  exports: [
    PageActionsComponent,
    PortalModule,
    ValueLabelPipe
  ]
})
export class SharedModule {}
