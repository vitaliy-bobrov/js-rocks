import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavConfigurationsComponent } from './nav-configurations.component';

xdescribe('NavConfigurationsComponent', () => {
  let component: NavConfigurationsComponent;
  let fixture: ComponentFixture<NavConfigurationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavConfigurationsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
