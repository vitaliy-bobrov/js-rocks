import * as axe from 'axe-core';
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnobComponent, KnobModule } from './knob.component';

declare global {
  namespace jest {
    interface Matchers<R, T> {
      hasNoAxeA11yViolations(): R;
    }
  }
}

expect.extend({
  async hasNoAxeA11yViolations(received: HTMLElement) {
    const options = {
      comment: 'aXe a11y checks',
      isNot: this.isNot,
      promise: this.promise
    };

    const results = await axe.run(received);
    const pass = results.violations.length === 0;

    const message = pass
      ? () =>
          this.utils.matcherHint(
            'hasNoAxeA11yViolations',
            undefined,
            undefined,
            options as any
          ) +
          '\n\n' +
          results.passes.map(rule => `Rule: ${rule.description}.`).join('/n')
      : () => {
          return (
            this.utils.matcherHint(
              'hasNoAxeA11yViolations',
              undefined,
              undefined,
              options as any
            ) +
            '\n\n' +
            results.violations
              .map(rule => {
                return `Rule: ${rule.description}. ${rule.help}: ${rule.helpUrl}`;
              })
              .join('/n')
          );
        };

    return { actual: received, message, pass };
  }
});

describe('KnobComponent', () => {
  let component: KnobComponent;
  let fixture: ComponentFixture<KnobComponent>;
  let debugElement: DebugElement;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [KnobModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnobComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    element = debugElement.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be accessible on initial state', async () => {
    await expect(element).hasNoAxeA11yViolations();
  });
});
