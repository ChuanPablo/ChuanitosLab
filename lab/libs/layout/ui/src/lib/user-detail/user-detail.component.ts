import { Component, Input, OnInit, OnDestroy, AfterViewInit, inject, ElementRef, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { User, UserSkill, UserTimelineEntry } from '@lab/shared-interfaces';
import { UserService, SkillsService, TimelineService  } from '@lab/core-services';
import { SKILL, VISIBILITY, TIMELINE_ENTRY, Utilities } from '@lab/shared-utils';
import { ConfirmDeleteDialogComponent, PdfUploadControlComponent } from '@lab/shared-ui';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';

interface SkillFormData {
  name: string;
  category: string;
  level: string;
  description?: string;
  yearsOfExperience?: number;
  documentation?: File | null;
  visibility: string;
}

interface TimelineFormData {
  title: string;
  organisation: string;
  location: string;
  timelineEntryType: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  documentation?: File | null;
  visibility: string;
}

@Component({
  selector: 'lib-layout-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatExpansionModule,
    MatBadgeModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    PdfUploadControlComponent,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() user?: User; // Optional - when passed from parent component
  @Input() userId?: number; // Optional - when passed from parent or for override

  @ViewChild('scrollContainer', { static: false }) scrollContainer?: ElementRef;

  private userService = inject(UserService);
  private skillsService = inject(SkillsService);
  private timelineService = inject(TimelineService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  currentUser: User | null = null;
  userSkills: UserSkill[] = [];
  timelineEntries: UserTimelineEntry[] = [];

  isLoading = true;
  error: string | null = null;
  isCompact = false;

  private scrollThreshold = 80; // Simple threshold
  private isTransitioning = false; // Lock to prevent rapid changes

  // Categorized skills
  technicalSkills: UserSkill[] = [];
  languageSkills: UserSkill[] = [];
  otherSkills: UserSkill[] = [];

  // Timeline entry types
  jobEntries: UserTimelineEntry[] = [];
  educationEntries: UserTimelineEntry[] = [];

  // Skill form state
  skillForm: FormGroup;
  showSkillForm = false;
  editingSkillId: number | null = null;
  isSubmittingSkill = false;
  selectedSkill: UserSkill | null = null;

  // Timeline form state
  timelineForm: FormGroup;
  showTimelineForm = false;
  editingTimelineId: number | null = null;
  isSubmittingTimeline = false;

  // Constants for dropdowns
  skillCategories = [
    { value: SKILL.category.TECHNICAL, label: 'Technical' },
    { value: SKILL.category.LANGUAGE, label: 'Language' },
    { value: SKILL.category.CREATIVE, label: 'Creative' },
    { value: SKILL.category.SOFT, label: 'Soft Skills' },
    { value: SKILL.category.OTHER, label: 'Other' }
  ];

  skillLevels = [
    { value: SKILL.level.BEGINNER, label: 'Beginner' },
    { value: SKILL.level.INTERMEDIATE, label: 'Intermediate' },
    { value: SKILL.level.ADVANCED, label: 'Advanced' },
    { value: SKILL.level.EXPERT, label: 'Expert' }
  ];

  visibilityOptions = [
    { value: VISIBILITY.PUBLIC, label: 'Public' },
    { value: VISIBILITY.PRIVATE, label: 'Private' }
  ];

  timelineEntryTypes = [
    { value: TIMELINE_ENTRY.type.JOB, label: 'Job' },
    { value: TIMELINE_ENTRY.type.EDUCATION, label: 'Education' }
  ];

  constructor() {
    this.skillForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
      category: ['', Validators.required],
      level: ['', Validators.required],
      description: ['', Validators.maxLength(500)],
      yearsOfExperience: [null, [Validators.min(0), Validators.max(99)]],
      documentation: [''],
      visibility: [VISIBILITY.PUBLIC, Validators.required]
    });

    this.timelineForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      organisation: ['', Validators.required],
      location: ['', Validators.required],
      timelineEntryType: ['', Validators.required],
      description: ['', Validators.maxLength(500)],
      startDate: [null, Validators.required],
      endDate: [null],
      documentation: [''],
      visibility: [VISIBILITY.PUBLIC, Validators.required]
    });
    console.log('SkillForm initialized:', this.skillForm);
    console.log('TimelineForm initialized:', this.timelineForm);
  }

  ngOnInit() {
    this.loadUserData();
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit called');
  }

  ngOnDestroy() {
    console.log('ngOnDestroy called');
  }

  onScroll(event: Event) {
    // If we're already transitioning, ignore scroll events
    if (this.isTransitioning) {
      return;
    }

    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;

    // Simple threshold check
    const shouldBeCompact = scrollTop > this.scrollThreshold;

    // Only update if state actually needs to change
    if (this.isCompact !== shouldBeCompact) {
      console.log(`Scroll: ${shouldBeCompact ? 'COMPACT' : 'EXPANDED'} at ${scrollTop}px`);

      // Lock transitions
      this.isTransitioning = true;

      // Update state immediately
      this.isCompact = shouldBeCompact;
      this.cdr.detectChanges();

      // Unlock after transition completes (300ms is our CSS transition duration)
      setTimeout(() => {
        this.isTransitioning = false;
      }, 350); // Slightly longer than CSS transition
    }
  }

  public loadUserData() {
    this.isLoading = true;
    this.error = null;

    // Get param userId
    const userIdString = this.route.snapshot.paramMap.get('userId');

    // Determine userId from: input > route params > user object
    const userId = this.userId ||
    userIdString && parseInt(userIdString) ||
    this.user?.id;

    if (!userId && !this.user) {
      this.error = 'User ID is required';
      this.isLoading = false;
      return;
    }

    // If user is provided, use it; otherwise fetch from API
    const userObservable = this.user ? of(this.user) : this.userService.getUserById(userId!);

    // Always fetch skills and timeline data
    const dataObservables = userObservable.pipe(
      switchMap(user => {
        if (!user) {
          throw new Error('User not found');
        }

        this.currentUser = user;
        const effectiveUserId = userId || user.id;

        return forkJoin({
          user: of(user),
          skills: this.skillsService.getUserSkills(effectiveUserId),
          timeline: this.timelineService.getUserTimelineEntries(effectiveUserId)
        });
      })
    );

    dataObservables.pipe(
      catchError(error => {
        this.error = 'Failed to load user data';
        console.error('Error loading user data:', error);
        return of({ user: null, skills: [], timeline: [] });
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(({ user, skills, timeline }) => {
      this.currentUser = user;
      this.userSkills = skills;
      this.timelineEntries = timeline;

      this.categorizeSkills();
      this.categorizeTimelineEntries();
    });
  }

  private categorizeSkills() {
    this.technicalSkills = this.userSkills.filter(skill =>
      skill.category?.toLowerCase().includes('technical') ||
      skill.category?.toLowerCase().includes('programming') ||
      skill.category?.toLowerCase().includes('software') ||
      skill.category?.toLowerCase().includes('technology')
    );

    this.languageSkills = this.userSkills.filter(skill =>
      skill.category?.toLowerCase().includes('language') ||
      skill.category?.toLowerCase().includes('linguistic')
    );

    this.otherSkills = this.userSkills.filter(skill =>
      !this.technicalSkills.includes(skill) &&
      !this.languageSkills.includes(skill)
    );
  }

  private categorizeTimelineEntries() {
    this.jobEntries = this.timelineEntries
      .filter(entry => entry.timelineEntryType?.toLowerCase() === 'job')
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    this.educationEntries = this.timelineEntries
      .filter(entry => entry.timelineEntryType?.toLowerCase() === 'education')
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  // Skill CRUD operations
  onAddSkill() {
    console.log('onAddSkill called'); // Debug log
    this.editingSkillId = null;
    this.skillForm.reset({
      name: '',
      category: '',
      level: '',
      description: '',
      yearsOfExperience: null,
      visibility: VISIBILITY.PUBLIC
    });
    this.showSkillForm = true;
    console.log('showSkillForm set to:', this.showSkillForm); // Debug log
  }

  onEditSkill(skill: UserSkill) {
    this.editingSkillId = skill.id;
    this.skillForm.patchValue({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      description: skill.description || '',
      yearsOfExperience: skill.yearsOfExperience || null,
      visibility: skill.visibility
    });
    this.showSkillForm = true;
  }

  onCancelSkillForm() {
    this.showSkillForm = false;
    this.editingSkillId = null;
    this.skillForm.reset();
  }

  onSubmitSkill() {
    if (this.skillForm.invalid || !this.currentUser) {
      this.markFormGroupTouched(this.skillForm);
      return;
    }

    this.isSubmittingSkill = true;
    const formValue = this.skillForm.value as SkillFormData;

    const formData = new FormData();
    formData.append('name', formValue.name);
    formData.append('category', formValue.category);
    formData.append('level', formValue.level);
    formData.append('description', formValue.description || '');
    formData.append('yearsOfExperience', formValue.yearsOfExperience?.toString() || '');
    formData.append('visibility', formValue.visibility);

    if (formValue.documentation){
      formData.append('documentation', formValue.documentation);
    }

    const operation = this.editingSkillId
      ? this.skillsService.updateSkill(this.currentUser.id, this.editingSkillId, formData)
      : this.skillsService.createSkill(this.currentUser.id, formData);

    operation.pipe(
      finalize(() => this.isSubmittingSkill = false)
    ).subscribe({
      next: (result) => {
        const message = this.editingSkillId ? 'Skill updated successfully' : 'Skill added successfully';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        this.onCancelSkillForm();
        this.refreshSkills();
      },
      error: (error) => {
        console.error('Error saving skill:', error);
        this.snackBar.open('Error saving skill. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onDeleteSkill(skill: UserSkill) {
    if (!this.currentUser) return;

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Skill',
        message: `Are you sure you want to delete "${skill.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.currentUser) {
        this.skillsService.deleteSkill(this.currentUser.id, skill.id).subscribe({
          next: () => {
            this.snackBar.open('Skill deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.refreshSkills();
          },
          error: (error) => {
            console.error('Error deleting skill:', error);
            this.snackBar.open('Error deleting skill. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  // Timeline CRUD operations
  onAddTimelineEntry() {
    this.editingTimelineId = null;
    this.timelineForm.reset({
      title: '',
      organisation: '',
      location: '',
      timelineEntryType: '',
      description: '',
      startDate: null,
      endDate: null,
      visibility: VISIBILITY.PUBLIC
    });
    this.showTimelineForm = true;
  }

  onEditTimelineEntry(entry: UserTimelineEntry) {
    this.editingTimelineId = entry.id;
    this.timelineForm.patchValue({
      title: entry.title,
      organisation: entry.organisation,
      location: entry.location,
      timelineEntryType: entry.timelineEntryType,
      description: entry.description || '',
      startDate: entry.startDate,
      endDate: entry.endDate,
      visibility: entry.visibility
    });
    this.showTimelineForm = true;
  }

  onCancelTimelineForm() {
    this.showTimelineForm = false;
    this.editingTimelineId = null;
    this.timelineForm.reset();
  }

  onSubmitTimeline() {
    if (this.timelineForm.invalid || !this.currentUser) {
      this.markFormGroupTouched(this.timelineForm);
      return;
    }

    this.isSubmittingTimeline = true;
    const formValue = this.timelineForm.value as TimelineFormData;

    const formData = new FormData();
    formData.append('title', formValue.title);
    formData.append('organisation', formValue.organisation);
    formData.append('location', formValue.location);
    formData.append('timelineEntryType', formValue.timelineEntryType);
    formData.append('description', formValue.description || '');
    formData.append('startDate', formValue.startDate.toISOString());
    formData.append('endDate', formValue.endDate ? formValue.endDate.toISOString() : '');
    formData.append('visibility', formValue.visibility);

    if (formValue.documentation) {
      formData.append('documentation', formValue.documentation);
    }

    const operation = this.editingTimelineId
      ? this.timelineService.updateTimelineEntry(this.currentUser.id, this.editingTimelineId, formData)
      : this.timelineService.createTimelineEntry(this.currentUser.id, formData);

    operation.pipe(
      finalize(() => this.isSubmittingTimeline = false)
    ).subscribe({
      next: (result) => {
        const message = this.editingTimelineId ? 'Timeline entry updated successfully' : 'Timeline entry added successfully';
        this.snackBar.open(message, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        this.onCancelTimelineForm();
        this.refreshTimelineEntries();
      },
      error: (error) => {
        console.error('Error saving timeline entry:', error);
        if (error.originalError?.error?.non_field_errors) {
          this.snackBar.open(error.originalError.error.non_field_errors[0], 'Close');
        } else {
          this.snackBar.open('Unexpected error saving timeline entry. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  onDeleteTimelineEntry(entry: UserTimelineEntry) {
    if (!this.currentUser) return;

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Timeline Entry',
        message: `Are you sure you want to delete "${entry.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.currentUser) {
        this.timelineService.deleteTimelineEntry(this.currentUser.id, entry.id).subscribe({
          next: () => {
            this.snackBar.open('Timeline entry deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.refreshTimelineEntries();
          },
          error: (error) => {
            console.error('Error deleting timeline entry:', error);
            this.snackBar.open('Error deleting timeline entry. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  private refreshSkills() {
    if (!this.currentUser) return;

    const userId = this.userId || this.currentUser.id;
    this.skillsService.getUserSkills(userId).subscribe({
      next: (skills) => {
        this.userSkills = skills;
        this.categorizeSkills();
      },
      error: (error) => {
        console.error('Error refreshing skills:', error);
      }
    });
  }

  private refreshTimelineEntries() {
    if (!this.currentUser) return;

    const userId = this.userId || this.currentUser.id;
    this.timelineService.getUserTimelineEntries(userId).subscribe({
      next: (entries) => {
        this.timelineEntries = entries;
        this.categorizeTimelineEntries();
      },
      error: (error) => {
        console.error('Error refreshing timeline entries:', error);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldErrorMessage(fieldName: string, formType: 'skill' | 'timeline' = 'skill'): string {
    const form = formType === 'skill' ? this.skillForm : this.timelineForm;
    const control = form.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    if (errors['required']) {
      return `${Utilities.getFormFieldDisplayNames(fieldName)} is required`;
    }
    if (errors['maxlength']) {
      return `${Utilities.getFormFieldDisplayNames(fieldName)} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['min']) {
      return `${Utilities.getFormFieldDisplayNames(fieldName)} cannot be less than ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `${Utilities.getFormFieldDisplayNames(fieldName)} cannot exceed ${errors['max'].max}`;
    }
    return 'Invalid value';
  }

  getInitials(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName?.charAt(0).toUpperCase() || ''}${this.currentUser.lastName?.charAt(0).toUpperCase() || ''}`;
  }

  getFullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim();
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'primary';
      case 'pending': return 'accent';
      case 'inactive': return 'warn';
      default: return '';
    }
  }

  getSkillLevelColor(level: string): string {
    switch (level?.toLowerCase()) {
      case 'expert': return 'primary';
      case 'advanced': return 'accent';
      case 'intermediate': return 'basic';
      case 'beginner': return 'warn';
      default: return '';
    }
  }

  formatDateRange(startDate: Date, endDate?: Date): string {
    const start = new Date(startDate).toLocaleDateString('en-US', { //todo probably change to other locale
      month: 'short',
      year: 'numeric'
    });

    if (!endDate) {
      return `${start} - Present`;
    }

    const end = new Date(endDate).toLocaleDateString('en-US', { //todo probably change to other locale
      month: 'short',
      year: 'numeric'
    });

    return `${start} - ${end}`;
  }

  calculateDuration(startDate: Date, endDate?: Date): string {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

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

    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  onEditUser() {
    // Emit event or navigate to edit page
    console.log('Edit user:', this.currentUser);
  }

  openExternalLink(url: string | undefined | null) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  setSelectedSkill(skill: UserSkill | null) {
    this.selectedSkill = skill;
  }
}

