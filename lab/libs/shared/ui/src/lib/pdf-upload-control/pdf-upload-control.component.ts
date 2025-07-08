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
export class PdfUploadControlComponent implements ControlValueAccessor, Validator {
  @Input() label = 'PDF Document';
  @Input() hint = 'Select a PDF file (max 10MB)';
  @Input() required = false;
  @Input() maxSizeBytes = 10 * 1024 * 1024; // 10MB default

  selectedFile: File | null = null;
  isDragOver = false;
  errorMessage = '';

  private onChange = (value: File | null) => {};
  private onTouched = () => {};

  // ControlValueAccessor implementation
  writeValue(value: File | null): void {
    this.selectedFile = value;
  }

  registerOnChange(fn: (value: File | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }

  // Validator implementation
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.required && !this.selectedFile) {
      return { required: true };
    }

    if (this.selectedFile) {
      if (this.selectedFile.type !== 'application/pdf') {
        return { invalidFileType: { actualType: this.selectedFile.type, expectedType: 'application/pdf' } };
      }

      if (this.selectedFile.size > this.maxSizeBytes) {
        return { fileTooLarge: { actualSize: this.selectedFile.size, maxSize: this.maxSizeBytes } };
      }
    }

    return null;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onKeyDown(event: KeyboardEvent) {
    // Handle Enter and Space key presses for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }


  private handleFile(file: File) {
    this.errorMessage = '';

    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Please select a PDF file only.';
      return;
    }

    if (file.size > this.maxSizeBytes) {
      this.errorMessage = `File size must be less than ${this.formatFileSize(this.maxSizeBytes)}.`;
      return;
    }

    this.selectedFile = file;
    this.onChange(file);
    this.onTouched();
  }

  clearFile() {
    this.selectedFile = null;
    this.errorMessage = '';
    this.onChange(null);
    this.onTouched();

    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
