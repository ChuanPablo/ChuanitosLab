import { booleanAttribute, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseFileFormControl, User } from '@lab/shared-interfaces';
import { MatIcon } from '@angular/material/icon';
import {
  AbstractControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';

export enum AvatarSize {
  Normal = 0,
  Small = 1,
  Compact = 2,
}

@Component({
  selector: 'lib-shared-ui-avatar',
  imports: [CommonModule, MatIcon],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvatarComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AvatarComponent),
      multi: true,
    },
  ],
})
export class AvatarComponent extends BaseFileFormControl {
  @Input({ required: true }) user!: User;
  @Input() isCompact = false;
  @Input() size: AvatarSize = AvatarSize.Normal;
  @Input({transform: booleanAttribute}) interactive = false;

  @Output() override fileSelected = new EventEmitter<File>();

  backgroundColor = 'black';

  constructor() {
    super();
    this.backgroundColor = this.randomColor;
  }

  // add file type check to validator
  override validate(control: AbstractControl): ValidationErrors | null {
    if (this.selectedFile && !this.selectedFile.type.startsWith('image/')) {
      return {
        invalidFileType: {
          actualType: this.selectedFile.type,
          expectedType: 'image/*',
        },
      };
    }
    return super.validate(control);
  }

  get initials(): string {
    if (!this.user.firstName || !this.user.lastName) {
      return '--';
    }
    return `${this.user.firstName.charAt(0)} ${this.user.lastName.charAt(0)}`;
  }

  get fullName(): string {
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  get randomColor(): string {
    const colors = [
      '#e91e63',
      '#9c27b0',
      '#673ab7',
      '#3f51b5',
      '#2196f3',
      '#03a9f4',
      '#00bcd4',
      '#009688',
      '#4caf50',
      '#8bc34a',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  protected readonly AvatarSize = AvatarSize;
}
