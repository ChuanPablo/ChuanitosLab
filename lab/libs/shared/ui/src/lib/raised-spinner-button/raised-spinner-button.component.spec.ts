import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RaisedSpinnerButtonComponent } from './raised-spinner-button.component';

describe('ButtonComponent', () => {
  let component: RaisedSpinnerButtonComponent;
  let fixture: ComponentFixture<RaisedSpinnerButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaisedSpinnerButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RaisedSpinnerButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
