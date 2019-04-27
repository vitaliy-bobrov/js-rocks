import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[jsrPedalBoard]'
})
export class PedalBoardDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
