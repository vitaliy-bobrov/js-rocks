import { Inject, Injectable, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SwUpdateService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private swUpdate: SwUpdate,
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document
  ) {}

  subscribeForUpdates() {
    this.swUpdate.available.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const snackBarRef = this.snackBar.open(
        'Newer version of the app is available.',
        'Refresh'
      );

      snackBarRef
        .onAction()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.activateUpdate());
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private activateUpdate() {
    this.swUpdate
      .activateUpdate()
      .then(() => this.document.defaultView.window.location.reload());
  }
}
