import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserTimelineEntryCardComponent } from './user-timeline-entry-card.component';

describe('UserTimelineEntryCardComponent', () => {
  let component: UserTimelineEntryCardComponent;
  let fixture: ComponentFixture<UserTimelineEntryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTimelineEntryCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserTimelineEntryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
