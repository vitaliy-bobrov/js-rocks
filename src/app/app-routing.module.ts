import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: 'stage',
    loadChildren: './stage/stage.module#StageModule'
  },
  {
    path: '',
    redirectTo: '/stage',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
      RouterModule.forRoot(
      routes,
      {preloadingStrategy: PreloadAllModules}
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
