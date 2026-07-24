import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePictureDialogComponent } from './profile-picture-dialog.component';

describe('ProfilePictureDialogComponent', () => {
  let component: ProfilePictureDialogComponent;
  let fixture: ComponentFixture<ProfilePictureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePictureDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilePictureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
