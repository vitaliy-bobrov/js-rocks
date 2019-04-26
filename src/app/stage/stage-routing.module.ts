import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StageComponent } from './stage/stage.component';

const routes: Routes = [
  {
    path: '',
    component: StageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StageRoutingModule {}
