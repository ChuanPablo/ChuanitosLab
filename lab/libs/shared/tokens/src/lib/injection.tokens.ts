// Export the token from the same file
import { InjectionToken } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';

export const GENERIC_DIALOG_COMPONENT = new InjectionToken<ComponentType<any>>('GenericDialogComponent');
