import { NgModule } from '@angular/core';
import { PortalModule } from '@angular/cdk/portal';
import { PageActionsComponent } from './page-actions/page-actions.component';

@NgModule({
  declarations: [PageActionsComponent],
  imports: [
    PortalModule
  ],
  exports: [PageActionsComponent, PortalModule]
})
export class SharedModule {}
