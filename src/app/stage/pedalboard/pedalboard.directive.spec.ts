import { ViewContainerRef } from '@angular/core';
import { PedalBoardDirective } from './pedalboard.directive';

describe('PedalBoardDirective', () => {
  let viewContainerRef: ViewContainerRef;

  beforeEach(() => {
    viewContainerRef = {createEmbeddedView: jest.fn()} as any;
  });

  it('should create an instance', () => {
    const directive = new PedalBoardDirective(viewContainerRef);
    expect(directive).toBeTruthy();
  });
});
