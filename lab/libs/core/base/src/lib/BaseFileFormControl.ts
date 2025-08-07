import { BaseFormControl } from './BaseFormControl';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { EventEmitter, Injectable, Output } from '@angular/core';

/**
 * @summary Base class for file form controls
 * @description This class provides basic functionality for file form controls
 * make sure to implement an <input type="file"> element in the template>
 * (it can be hidden)
 * @see BaseFormControl
 */
@Injectable()
export abstract class BaseFileFormControl extends BaseFormControl {
  @Output() fileSelected = new EventEmitter<File>();
  protected selectedFile: File | null = null;
  protected maxSizeBytes = 10 * 1024 * 1024; // 10MB
  protected isDragOver = false;

  public override validate(control: AbstractControl): ValidationErrors | null {
    if (this.required && !this.selectedFile) {
      return { required: true };
    }

    if (this.selectedFile) {
      if (this.selectedFile.size > this.maxSizeBytes) {
        return { fileTooLarge: { actualSize: this.selectedFile.size, maxSize: this.maxSizeBytes } };
      }
    }
    return null;
  }

  protected handleFile(file: File){
    this.selectedFile = file;
    this._onChange(file);
    this._onTouched();
    this.fileSelected.emit(file);
  }

  protected clearFile() {
    this.selectedFile = null;
    this.errorMessage = '';
    this._onChange(null);
    this._onTouched();

    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  protected onFileSelected($event: Event) {
    const file = ($event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

  protected onKeyDown(event: KeyboardEvent) {
    // Handle Enter and Space key presses for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }

  protected onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  protected onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  protected onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

}
