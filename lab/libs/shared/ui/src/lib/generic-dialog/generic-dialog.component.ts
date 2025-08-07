import {
  AfterViewInit,
  Component,
  ComponentRef,
  Inject,
  OnDestroy,
  Type,
  ViewChild,
} from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Subscription } from 'rxjs';

export interface GenericDialogData {
  title: string;
  component: Type<any>;
  componentInputs?: any;
  noScroll?: boolean;
}

@Component({
  selector: 'lib-shared-ui-generic-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './generic-dialog.component.html',
  styleUrl: './generic-dialog.component.scss'
})
export class GenericDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild(NgComponentOutlet, { static: false }) componentOutlet!: NgComponentOutlet;
  private subscriptions: Subscription[] = [];
  public noScroll = false;

  constructor(
    public dialogRef: MatDialogRef<GenericDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GenericDialogData
  ) {
    if(data.noScroll) {
      this.noScroll = true;
    }
  }

  ngAfterViewInit(): void {
    // Wait for the component to be initialized and check for events
    setTimeout(() => {
      const componentRef = this.componentOutlet?.['_componentRef'] as ComponentRef<any>;

      if (componentRef?.instance) {
        if (componentRef.instance.wizardCompleted) {
          const sub = componentRef.instance.wizardCompleted.subscribe(() => {
            this.onClose();
          });
          this.subscriptions.push(sub);
        }

        // Handle editUser events - forward to parent via dialog result
        if (componentRef.instance.editUser) {
          const sub = componentRef.instance.editUser.subscribe((user: any) => {
            this.dialogRef.close({ action: 'editUser', data: user });
          });
          this.subscriptions.push(sub);
        }

        if(componentRef.instance.editingCanceled) {
          const sub = componentRef.instance.editingCanceled.subscribe(() => {
            this.onClose();
          });
          this.subscriptions.push(sub);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
