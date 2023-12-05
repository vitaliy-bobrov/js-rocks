import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WapUrlDialogComponent } from './wap-url-dialog.component';

xdescribe('WapUrlDialogComponent', () => {
  let component: WapUrlDialogComponent;
  let fixture: ComponentFixture<WapUrlDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WapUrlDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WapUrlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
