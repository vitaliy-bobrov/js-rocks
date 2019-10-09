import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresetNameDialogComponent } from './preset-name-dialog.component';

xdescribe('PresetNameDialogComponent', () => {
  let component: PresetNameDialogComponent;
  let fixture: ComponentFixture<PresetNameDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresetNameDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresetNameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
