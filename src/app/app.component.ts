import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { MatDrawer } from '@angular/material/sidenav';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { tap } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { SwUpdateService } from './sw-update/sw-update.service';

@Component({
  selector: 'jsr-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild(MatDrawer, { static: true })
  drawer: MatDrawer;

  constructor(
    readonly iconRegistry: MatIconRegistry,
    readonly sanitizer: DomSanitizer,
    private gtmService: GoogleTagManagerService,
    private swUpdateService: SwUpdateService,
    private router: Router
  ) {
    iconRegistry.addSvgIcon(
      'arrow_forward',
      sanitizer.bypassSecurityTrustResourceUrl('assets/svg/arrow_forward.svg')
    );
    iconRegistry.addSvgIcon(
      'menu',
      sanitizer.bypassSecurityTrustResourceUrl('assets/svg/menu.svg')
    );
    iconRegistry.addSvgIcon(
      'speaker',
      sanitizer.bypassSecurityTrustResourceUrl('assets/svg/speaker.svg')
    );
    iconRegistry.addSvgIcon(
      'more_vert',
      sanitizer.bypassSecurityTrustResourceUrl('assets/svg/more_vert.svg')
    );
    iconRegistry.addSvgIcon(
      'radio_button_checked',
      sanitizer.bypassSecurityTrustResourceUrl(
        'assets/svg/radio_button_checked.svg'
      )
    );
    iconRegistry.addSvgIcon(
      'radio_button_unchecked',
      sanitizer.bypassSecurityTrustResourceUrl(
        'assets/svg/radio_button_unchecked.svg'
      )
    );
    iconRegistry.addSvgIcon(
      'list',
      sanitizer.bypassSecurityTrustResourceUrl('assets/svg/list.svg')
    );
    iconRegistry.addSvgIcon(
      'add',
      sanitizer.bypassSecurityTrustResourceUrl('assets/svg/add.svg')
    );
    iconRegistry.addSvgIcon(
      'delete',
      sanitizer.bypassSecurityTrustResourceUrl('assets/svg/delete.svg')
    );
    iconRegistry.addSvgIcon(
      'save',
      sanitizer.bypassSecurityTrustResourceUrl('assets/svg/save.svg')
    );
    iconRegistry.addSvgIcon(
      'blank',
      sanitizer.bypassSecurityTrustResourceUrl('assets/svg/blank.svg')
    );
    iconRegistry.addSvgIcon(
      'settings_input_svideo',
      sanitizer.bypassSecurityTrustResourceUrl(
        'assets/svg/settings_input_svideo.svg'
      )
    );
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
