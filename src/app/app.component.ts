import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  PLATFORM_ID
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { MatDrawer } from '@angular/material/sidenav';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { tap } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { SwUpdateService } from './sw-update/sw-update.service';
import { isPlatformServer } from '@angular/common';

@Component({
  selector: 'jsr-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild(MatDrawer, { static: true })
  drawer: MatDrawer;

  showIcons = true;

  constructor(
    readonly iconRegistry: MatIconRegistry,
    readonly sanitizer: DomSanitizer,
    private gtmService: GoogleTagManagerService,
    private swUpdateService: SwUpdateService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: string
  ) {
    if (isPlatformServer(platformId)) {
      this.showIcons = false;
    }

    const icons = [
      'arrow_forward',
      'menu',
      'speaker',
      'more_vert',
      'radio_button_checked',
      'radio_button_unchecked',
      'list',
      'add',
      'delete',
      'save',
      'blank',
      'settings_input_svideo'
    ];

    for (const icon of icons) {
      iconRegistry.addSvgIcon(
        icon,
        sanitizer.bypassSecurityTrustResourceUrl(`assets/svg/${icon}.svg`)
      );
    }
  }

  ngOnInit() {
    if (environment.production) {
      this.router.events.pipe(
        tap(event => {
          if (event instanceof NavigationEnd) {
            this.gtmService.pushTag({
              event: 'page',
              pageName: event.url
            });
          }
        })
      );

      this.swUpdateService.subscribeForUpdates();
    }
  }
}
