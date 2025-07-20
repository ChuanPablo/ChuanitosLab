import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR, ValidationErrors,
  Validator
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { BaseFileFormControl } from '@lab/shared-interfaces';

@Component({
  selector: 'lib-shared-ui-pdf-upload-control',
  imports: [CommonModule,  MatIcon],
  templateUrl: './pdf-upload-control.component.html',
  styleUrl: './pdf-upload-control.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PdfUploadControlComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PdfUploadControlComponent),
      multi: true
    }
  ]
})
export class PdfUploadControlComponent extends BaseFileFormControl {
  @Input() label = 'PDF Document';
  @Input() hint = 'Select a PDF file (max 10MB)';

  // Validator implementation
  public override validate(control: AbstractControl): ValidationErrors | null {
    if (this.selectedFile) {
      if (this.selectedFile.type !== 'application/pdf') {
        return { invalidFileType: { actualType: this.selectedFile.type, expectedType: 'application/pdf' } };
      }
    }
    return super.validate(control);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
