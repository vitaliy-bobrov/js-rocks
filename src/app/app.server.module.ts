import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { Routes, RouterModule } from '@angular/router';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { AppShellComponent } from './app-shell/app-shell.component';

const routes: Routes = [{ path: 'shell', component: AppShellComponent }];

@NgModule({
  imports: [AppModule, RouterModule.forRoot(routes), ServerModule],
  bootstrap: [AppComponent],
  declarations: [AppShellComponent]
})
export class AppServerModule {}
