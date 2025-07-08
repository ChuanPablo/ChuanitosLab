import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfUploadControlComponent } from './pdf-upload-control.component';

describe('PdfUploadControlComponent', () => {
  let component: PdfUploadControlComponent;
  let fixture: ComponentFixture<PdfUploadControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfUploadControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfUploadControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
