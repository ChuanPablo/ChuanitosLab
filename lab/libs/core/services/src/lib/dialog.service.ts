import { Inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { GENERIC_DIALOG_COMPONENT } from '@lab/injection-tokens';

export interface DialogConfig<T = any> {
  title: string;
  componentClass: ComponentType<any>;
  componentInputs?: T;
  afterClosedPredicate?: (result: any) => boolean;
  noScroll?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(
    private dialog: MatDialog,
    @Inject(GENERIC_DIALOG_COMPONENT) private genericDialogComponent: ComponentType<any>
  ) {}

  openGenericDialog<T>(config: DialogConfig<T>): MatDialogRef<any> {
    const dialogRef = this.dialog.open(this.genericDialogComponent, {
      data: {
        title: config.title,
        component: config.componentClass,
        componentInputs: config.componentInputs,
        noScroll: config.noScroll,
      },
      width: '95vw',
      maxWidth: '1200px',
      height: '95vh',
      maxHeight: '1000px',
      panelClass: 'user-detail-dialog',
      autoFocus: false,
      restoreFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (config.afterClosedPredicate) {
        if (config.afterClosedPredicate(result)) {
          console.log('Dialog result:', result);
        }
      } else if (result) {
        console.log('Dialog result:', result);
      }
    });

    return dialogRef;
  }
}
