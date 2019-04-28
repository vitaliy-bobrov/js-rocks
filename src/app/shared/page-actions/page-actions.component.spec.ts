import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageActionsComponent } from './page-actions.component';

describe('PageActionsComponent', () => {
  let component: PageActionsComponent;
  let fixture: ComponentFixture<PageActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
