import {
  Component,
  AfterViewInit,
  ComponentFactoryResolver,
  Injector,
  ApplicationRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { DomPortalOutlet, PortalOutlet, CdkPortal } from '@angular/cdk/portal';

@Component({
  selector: 'jsr-page-actions',
  template: `
    <ng-template cdkPortal>
      <ng-content></ng-content>
    </ng-template>
  `
})
export class PageActionsComponent implements AfterViewInit, OnDestroy {
  private portalHost: PortalOutlet;
  @ViewChild(CdkPortal) portal: CdkPortal;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  ngAfterViewInit() {
    // Create a portalHost from a DOM element
    this.portalHost = new DomPortalOutlet(
      document.querySelector('#page-actions-container'),
      this.componentFactoryResolver,
      this.appRef,
      this.injector
    );

    // Attach portal to host
    this.portalHost.attach(this.portal);
  }

  ngOnDestroy() {
    this.portalHost.detach();
  }
}
