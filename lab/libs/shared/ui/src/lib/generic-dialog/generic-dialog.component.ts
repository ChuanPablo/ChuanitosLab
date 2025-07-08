import { Component, Inject, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

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
export class GenericDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<GenericDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GenericDialogData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
