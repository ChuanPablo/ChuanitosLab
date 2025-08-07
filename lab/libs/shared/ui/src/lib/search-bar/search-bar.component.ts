import {
  AfterViewInit,
  booleanAttribute,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
  HostListener,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchService, SearchSuggestion } from '@lab/core-services';
import { Observable, Subscription } from 'rxjs';
import { Utilities } from '@lab/shared-utils';

@Component({
  selector: 'lib-shared-ui-search-bar',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements AfterViewInit, OnDestroy {
  // Input
  @Input({ transform: booleanAttribute }) compact = false;

  // Output
  @Output() suggestionSelected = new EventEmitter<SearchSuggestion>();
  @Output() searchSubmitted = new EventEmitter<string>();
  @Output() searchIconClicked = new EventEmitter<string>();

  // ViewChild references
  @ViewChild('hiddenContent') ngContentWrapper?: ElementRef;
  @ViewChild('searchInput') searchInputRef?: ElementRef;

  // Dependency Injection
  private searchService = inject(SearchService);
  private cdr = inject(ChangeDetectorRef);

  public searchControl = new FormControl('');
  public searchSuggestions$: Observable<SearchSuggestion[]>;
  public suggestions: SearchSuggestion[] = [];
  public placeholder = 'Search...'
  public showSuggestions = false;
  public selectedSuggestionIndex = -1;

  private suggestionsSubscription?: Subscription;

  // Properties
  /**
   * @summary Gets the current trimmed search query
   * @returns Current trimmed search query
   */
  get searchQuery() {
    return this.searchControl.value?.trim();
  }

  constructor() {
    // Setup debounced search suggestions using the service's debounced method
    this.searchSuggestions$ = this.setupDebouncedSearch();
  }

  ngAfterViewInit(): void {
    const contentText = this.ngContentWrapper?.nativeElement.textContent?.trim();
    if (contentText) {
      this.placeholder = contentText;
      // Trigger change detection to update the view
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.suggestionsSubscription?.unsubscribe();
  }

  /**
   * @summary Sets up debounced search using the SearchService's built-in debouncing
   * @description Connects the form control to the service's search query and uses debounced suggestions
   */
  private setupDebouncedSearch(): Observable<SearchSuggestion[]> {
    // Connect form control changes to the search service
    this.searchControl.valueChanges.subscribe((value) => {
      if (!Utilities.isString(value)) {
        return;
      }
      this.searchService.searchQuery = value;
      this.showSuggestions = value.trim().length > 0;
      this.selectedSuggestionIndex = -1;
    });

    // Use the service's debounced suggestions (300ms default debounce)
    const suggestions$ = this.searchService.createDebouncedSuggestions();

    // Subscribe to suggestions to keep local array updated
    this.suggestionsSubscription = suggestions$.subscribe(suggestions => {
      this.suggestions = suggestions;
    });

    return suggestions$;
  }

  private clearSearch() {
    this.searchControl.setValue('');
    this.searchService.searchQuery = '';
    this.showSuggestions = false;
    this.selectedSuggestionIndex = -1;
  }

  /**
   * @summary Gets display text for autocomplete option
   * @param suggestion - The search suggestion
   * @returns Display text for the suggestion
   */
  displaySuggestion(suggestion: SearchSuggestion): string {
    return suggestion ? suggestion.displayText : '';
  }

  /**
   * @summary Handles search form submission
   * @description clears search bar and query and emits searchSubmitted event
   * @emits searchSubmitted(searchQuery: string)
   */
  onSearchSubmit() {
    const query = this.searchQuery;
    this.clearSearch();
    this.searchSubmitted.emit(query);
  }

  /**
   * @summary Handles search icon click
   * @description clears search bar and query and emits searchIconClicked event
   * @emits searchIconClicked(searchQuery: string)
   */
  onSearchIconClick() {
    const query = this.searchQuery;
    this.clearSearch();
    this.searchIconClicked.emit(query);
  }

  /**
   * @summary Handles suggestion selection
   * @description clears search bar and emits suggestionSelected event
   * @param selectedSuggestion
   * @emits suggestionSelected(selectedSuggestion: SearchSuggestion)
   */
  onSuggestionSelected(selectedSuggestion: SearchSuggestion) {
    this.clearSearch();
    this.suggestionSelected.emit(selectedSuggestion);
  }

  /**
   * @summary Handles input focus to show suggestions
   */
  onInputFocus() {
    if (this.searchQuery && this.searchQuery.length > 0) {
      this.showSuggestions = true;
    }
  }

  /**
   * @summary Handles input blur to hide suggestions (with delay for clicks)
   */
  onInputBlur() {
    // Add small delay to allow suggestion clicks to register
    setTimeout(() => {
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
    }, 200);
  }

  /**
   * @summary Handles keyboard navigation in suggestions
   */
  onKeyDown(event: KeyboardEvent) {
    if (!this.suggestions || this.suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.min(
          this.selectedSuggestionIndex + 1,
          this.suggestions.length - 1
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.max(
          this.selectedSuggestionIndex - 1,
          -1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedSuggestionIndex >= 0) {
          this.onSuggestionSelected(this.suggestions[this.selectedSuggestionIndex]);
        } else {
          this.onSearchSubmit();
        }
        break;
      case 'Escape':
        this.showSuggestions = false;
        this.selectedSuggestionIndex = -1;
        this.searchInputRef?.nativeElement.blur();
        break;
    }
  }

  /**
   * @summary Handles clicks outside the component to hide suggestions
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const searchContainer = target.closest('.search-container, .mobile-search-container');
    if (!searchContainer) {
      this.showSuggestions = false;
      this.selectedSuggestionIndex = -1;
    }
  }
}
