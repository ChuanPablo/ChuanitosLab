import { AfterContentInit, Component, ContentChild, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButton} from "@angular/material/button";
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'lib-shared-ui-raised-spinner-button',
  imports: [CommonModule, MatButton, MatProgressSpinner],
  templateUrl: './raised-spinner-button.component.html',
  styleUrl: './raised-spinner-button.component.scss',
})
export class RaisedSpinnerButtonComponent {
  @Input() isLoading = false;
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();

  onClick() {
    this.clicked.emit();
  }
}
