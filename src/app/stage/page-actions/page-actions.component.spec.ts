import {
  async,
  ComponentFixture,
  TestBed,
  inject
} from '@angular/core/testing';
import { PortalModule } from '@angular/cdk/portal';

import { PageActionsComponent } from './page-actions.component';
import { ComponentFactoryResolver } from '@angular/core';

xdescribe('PageActionsComponent', () => {
  let component: PageActionsComponent;
  let fixture: ComponentFixture<PageActionsComponent>;
  let componentFactoryResolver: ComponentFactoryResolver;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PageActionsComponent]
    })
      .configureTestingModule({ imports: [PortalModule] })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageActionsComponent);
    inject([ComponentFactoryResolver], (cfr: ComponentFactoryResolver) => {
      componentFactoryResolver = cfr;
    })();
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
