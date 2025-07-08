import { Component, Inject, Type, ViewChild, ComponentRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgComponentOutlet } from '@angular/common';
import { Subscription } from 'rxjs';

export interface GenericDialogData {
  title: string;
  component: Type<any>;
  componentInputs?: any;
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
  private subscription?: Subscription;

  constructor(
    public dialogRef: MatDialogRef<GenericDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GenericDialogData
  ) {}

  ngAfterViewInit(): void {
    // Wait for the component to be initialized and check if it has the registrationCompleted event
    setTimeout(() => {
      const componentRef = this.componentOutlet?.['_componentRef'] as ComponentRef<any>;
      if (componentRef?.instance?.wizardCompleted) {
        this.subscription = componentRef.instance.wizardCompleted.subscribe(() => {
          this.onClose();
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
