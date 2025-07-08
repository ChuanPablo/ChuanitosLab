import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '@lab/shared-interfaces'

@Component({
  selector: 'lib-user-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() showActions = true;

  @Output() editUser = new EventEmitter<User>();
  @Output() deleteUser = new EventEmitter<User>();
  @Output() toggleStatus = new EventEmitter<User>();
  @Output() viewDetails = new EventEmitter<User>();

  onEdit() {
    this.editUser.emit(this.user);
  }

  onDelete() {
    this.deleteUser.emit(this.user);
  }

  onToggleStatus() {
    this.toggleStatus.emit(this.user);
  }

  onViewDetails() {
    this.viewDetails.emit(this.user);
  }

  getInitials(): string {
    return `${this.user.firstName?.charAt(0).toUpperCase()} ${this.user.lastName?.charAt(0).toUpperCase()}`;
  }

  getFullName() {
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'pending': return 'accent';
      default: return '';
    }
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    }
    if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} months ago`;
    }
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}
