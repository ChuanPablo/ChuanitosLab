import { AbstractControl, ControlValueAccessor, ValidationErrors, Validator } from '@angular/forms';
import { Injectable, Input } from '@angular/core';

/**
 * @summary Base class for custom form controls
 * @description This class provides basic functionality for form controls
 * make sure to implement the following methods in child classes:
 * - `setDisabledState(isDisabled: boolean): void`
 * - `validate(control: AbstractControl): ValidationErrors | null`
 * @see ControlValueAccessor
 * @see Validator
 * @see AbstractControl
 * @see ValidationErrors
 */
@Injectable()
export abstract class BaseFormControl implements ControlValueAccessor, Validator {
  @Input() required = false;
  private _errorMessage = '';
  public get errorMessage(): string {
    return this._errorMessage;
  }
  public set errorMessage(value: string) {
    if(!value || value.length === 0 || value === this._errorMessage) {
      return
    }
    this._errorMessage = value;
  }
  protected _value: any;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected _onChange = (value: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected _onTouched = () => {};

  writeValue(value: any): void {
    this._value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Override in child if needed
  }

  validate(control: AbstractControl): ValidationErrors | null {
    // Override in child if needed
    return null;
  }

  // Protected helper for child classes
  protected updateValue(newValue: any): void {
    this._value = newValue;
    this._onChange(newValue);
    this._onTouched();
  }
}
