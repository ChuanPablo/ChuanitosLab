import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSkillChipComponent } from './user-skill-chip.component';

describe('UserSkillCardComponent', () => {
  let component: UserSkillChipComponent;
  let fixture: ComponentFixture<UserSkillChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSkillChipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSkillChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
