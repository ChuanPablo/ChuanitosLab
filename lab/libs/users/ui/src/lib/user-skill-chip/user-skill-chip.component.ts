import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSkill } from '@lab/shared-interfaces';
import { UserAuthUtilsService } from '@lab/core-services';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatChip } from '@angular/material/chips';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'lib-users-ui-user-skill-chip',
  imports: [
    CommonModule,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatChip,
    MatTooltip,
    MatIconButton,
  ],
  templateUrl: './user-skill-chip.component.html',
  styleUrl: './user-skill-chip.component.scss',
})
export class UserSkillChipComponent {
  // Input
  @Input({ required: true }) skill!: UserSkill;

  // Output
  @Output() menuOpened = new EventEmitter<UserSkill>();
  @Output() editSkill = new EventEmitter<UserSkill>();
  @Output() deleteSkill = new EventEmitter<UserSkill>();

  // Dependency Injection
  private authUtils = inject(UserAuthUtilsService);

  canEditUser = (userId: number) => this.authUtils.canEditUser(userId);

  // Globals
  _menuOpened = false;

  //constructor() {}

  getSkillLevelColor(level: string): string {
    switch (level?.toLowerCase()) {
      case 'expert':
        return 'primary';
      case 'advanced':
        return 'accent';
      case 'intermediate':
        return 'basic';
      case 'beginner':
        return 'warn';
      default:
        return '';
    }
  }

  onMenuOpened() {
    this._menuOpened = true;
    this.menuOpened.emit(this.skill);
  }

  onEditSkill() {
    this.editSkill.emit(this.skill);
  }

  onDeleteSkill() {
    this.deleteSkill.emit(this.skill);
  }
}
