import {
  Component,
  OnInit,
  AfterViewInit,
  ComponentFactoryResolver,
  Injector,
  ApplicationRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
import {
  DomPortalHost,
  PortalHost,
  CdkPortal
} from '@angular/cdk/portal';

@Component({
  selector: 'jsr-page-actions',
  template: `
  <ng-template cdk-portal>
    <ng-content></ng-content>
  </ng-template>
  `
})
export class PageActionsComponent implements OnInit, AfterViewInit, OnDestroy {
  private portalHost: PortalHost;
  @ViewChild(CdkPortal, { static: true }) portal;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef
  ) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    // Create a portalHost from a DOM element
    this.portalHost = new DomPortalHost(
      document.querySelector('#page-actions-container'),
      this.componentFactoryResolver,
      this.appRef,
      this.injector
    );

    // Attach portal to host
    this.portalHost.attach(this.portal);
  }

  ngOnDestroy(): void {
    this.portalHost.detach();
  }
}
