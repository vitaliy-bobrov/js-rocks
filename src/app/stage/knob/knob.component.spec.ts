import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnobComponent } from './knob.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from '@shared/shared.module';

describe('KnobComponent', () => {
  let component: KnobComponent;
  let fixture: ComponentFixture<KnobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatTooltipModule,
        SharedModule
      ],
      declarations: [KnobComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
