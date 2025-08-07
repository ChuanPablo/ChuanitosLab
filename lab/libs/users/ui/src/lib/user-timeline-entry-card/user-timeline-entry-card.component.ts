import {
  Component,
  EventEmitter,
  inject,
  Input,
  LOCALE_ID,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserTimelineEntry } from '@lab/shared-interfaces';
import { MatIconButton } from '@angular/material/button';
import { UserAuthUtilsService } from '@lab/core-services';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TimelineEntry } from '@lab/shared-interfaces';

/**
 * Key-value set using TimelineEntry.Type values as keys
 */
export const TimelineEntryTypeIconMapping = {
  [TimelineEntry.Type.Job]: 'work',
  [TimelineEntry.Type.Education]: 'school',
} as const;

/**
 * @Summary Component to display a timeline entry card
 * @input timelineEntry - The timeline entry to display
 * @input type - The type of timeline entry (job or education)
 * @output editTimelineEntry - Event emitter for when editing button is clicked
 * @output deleteTimelineEntry - Event emitter for when delete button is clicked
 * @output viewDocumentation - Event emitter for when view documentation button is clicked
 * @usage
 * <lib-users-ui-user-timeline-entry-card
 *   type="job"
 *   [timelineEntry]="timelineEntry"
 *   (editTimelineEntry)="onEditTimelineEntry($event)"
 *   (deleteTimelineEntry)="onDeleteTimelineEntry($event)"
 *   (viewDocumentation)="onViewDocumentation($event)"
 * ></lib-users-ui-user-timeline-entry-card>
 */
@Component({
  selector: 'lib-users-ui-user-timeline-entry-card',
  imports: [
    CommonModule,
    MatIcon,
    MatIconButton,
    MatTooltip,
  ],
  templateUrl: './user-timeline-entry-card.component.html',
  styleUrl: './user-timeline-entry-card.component.scss',
})
export class UserTimelineEntryCardComponent {
  // Inputs
  @Input({ required: true }) timelineEntry!: UserTimelineEntry;
  @Input() type: typeof TimelineEntry.Type[keyof typeof TimelineEntry.Type] = TimelineEntry.Type.Job;

  // Output
  @Output() editTimelineEntry = new EventEmitter<UserTimelineEntry>();
  @Output() deleteTimelineEntry = new EventEmitter<UserTimelineEntry>();
  @Output() viewDocumentation = new EventEmitter<UserTimelineEntry>();

  // Dependency injection
  private locale = inject(LOCALE_ID);
  private authUtils = inject(UserAuthUtilsService);

  // Properties
  get icon(): string {
    return TimelineEntryTypeIconMapping[this.type];
  }

  // Auth Utils
  public canEditUser = (userId: number) => this.authUtils.canEditUser(userId);

  onEditTimelineEntry() {
    this.editTimelineEntry.emit(this.timelineEntry);
  }

  onDeleteTimelineEntry() {
    this.deleteTimelineEntry.emit(this.timelineEntry);
  }

  onViewDocumentation() {
    this.viewDocumentation.emit(this.timelineEntry);
  }

  formatDateRange(): string {
    const start = new Date(this.timelineEntry.startDate).toLocaleDateString(
      this.locale || 'en-US',
      {
        month: 'short',
        year: 'numeric',
      }
    );

    if (!this.timelineEntry.endDate) {
      return `${start} - Present`;
    }

    const end = new Date(this.timelineEntry.endDate).toLocaleDateString(
      this.locale || 'en-US',
      {
        month: 'short',
        year: 'numeric',
      }
    );

    return `${start} - ${end}`;
  }

  calculateDuration(): string {
    const start = new Date(this.timelineEntry.startDate);
    const end = this.timelineEntry.endDate
      ? new Date(this.timelineEntry.endDate)
      : new Date();

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    }

    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;

    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }

    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${
      remainingMonths !== 1 ? 's' : ''
    }`;
  }
}
