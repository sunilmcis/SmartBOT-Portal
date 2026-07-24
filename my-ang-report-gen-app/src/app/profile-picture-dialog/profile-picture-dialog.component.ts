import { Component, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { downscaleImage } from './downscale-image';

@Component({
  selector: 'app-profile-picture-dialog',
  standalone: true,
  templateUrl: './profile-picture-dialog.component.html',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    HttpClientModule,
    MatProgressSpinnerModule

  ]
})
export class ProfilePictureDialogComponent {
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  profileImageUrl: string | null = null;
  uploadInProgress = false;
  public downscaledBlob: Blob | null = null;
  previewInProgress = false;


  //previewUrl: string = '';
  formData: FormData = new FormData();
  username: string = ''; // Or pre-fill from logged-in user

  private dialogRef = inject(MatDialogRef<ProfilePictureDialogComponent>);
  private http = inject(HttpClient);
  public authService = inject(AuthService);

  constructor(private ngZone: NgZone, private cdRef: ChangeDetectorRef) {}


downscaleImage(file: File ,maxSize = 300): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const previewStart = performance.now();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.floor((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.floor((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Canvas context is null');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 📦 Convert canvas to Blob (JPEG or WebP)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const previewEnd = performance.now();
              console.log(
                `✅ Downscaled preview load time: ${(previewEnd - previewStart).toFixed(2)} ms`
              );
              resolve(blob);
            } else {
              reject('Failed to create Blob');
            }
          },
          'image/webp', // Or 'image/jpeg'
          0.8 // Quality (0.0 - 1.0)
        );
      };

      img.onerror = () => reject('Image load error');
    };

    reader.onerror = () => reject('File read error');
    reader.readAsDataURL(file);
  });
}


// async onFileSelected(event: Event): Promise<void> {
//   const input = event.target as HTMLInputElement;
//   if (input.files && input.files.length > 0) {
//     const file = input.files[0];
//     this.selectedFile = file;
//
//     const start = performance.now();
//
//     // 👇 Downscale image before previewing
// //     const previewBlob = await this.downscaleImage(file,150);
//     this.downscaledBlob = await this.downscaleImage(file,150);
//     //const previewUrl = URL.createObjectURL(previewBlob);
//     const previewUrl = URL.createObjectURL(this.downscaledBlob);
//
//     this.ngZone.runOutsideAngular(() => {
//       requestAnimationFrame(() => {
//         this.previewUrl = previewUrl;
//         this.ngZone.run(() => {
//           const end = performance.now();
//           console.log(`✅ Downscaled preview load time: ${(end - start).toFixed(2)} ms`);
//           this.cdRef.detectChanges();
//         });
//       });
//     });
//   }
// }

async onFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    this.selectedFile = file;

    this.previewInProgress = true; // Start spinner

    const start = performance.now();

    try {
      this.downscaledBlob = await this.downscaleImage(file, 150);
      const previewUrl = URL.createObjectURL(this.downscaledBlob);

      this.ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
          this.previewUrl = previewUrl;
          this.ngZone.run(() => {
            const end = performance.now();
            console.log(`✅ Downscaled preview load time: ${(end - start).toFixed(2)} ms`);
            this.cdRef.detectChanges();
            this.previewInProgress = false; // Stop spinner
          });
        });
      });
    } catch (err) {
      console.error('Image preview failed:', err);
      this.previewInProgress = false;
    }
  }
}



async uploadProfile(): Promise<void> {
  const savedUser = localStorage.getItem('user');
  console.log('Missing user-1',savedUser);
  console.log('Missing user-2',this.selectedFile);
  console.log('Missing user-3',this.downscaledBlob);

  if (!savedUser || !this.selectedFile || !this.downscaledBlob) {
    console.error('Missing user info, selected file, or downscaled blob');
    return;
  }

  const user = JSON.parse(savedUser);
  const start = performance.now();
  this.uploadInProgress = true;



  const downsizedFile = new File([this.downscaledBlob], this.selectedFile.name, {
    type: 'image/jpeg'
  });

  const formData = new FormData();
  formData.append('username', user.username);
  formData.append('profilePicture', downsizedFile);

  formData.forEach((value, key) => {
    if (value instanceof Blob) {
      console.log(`FormData key: ${key} => Blob (name: ${value.name}, size: ${value.size} bytes)`);
    } else {
      console.log(`FormData key: ${key} => ${value}`);
    }
  });

  this.http.post<{ fileUrl: string }>('http://localhost:3017/api/upload-profile-picture', formData).subscribe({
    next: (res) => {
      const end = performance.now();
      console.log(`📤 Upload request + response time: ${(end - start).toFixed(2)} ms`);
      this.uploadInProgress = false;
      const filename = res.fileUrl.split('/').pop()!;
      this.authService.setProfilePicture(filename);
      this.dialogRef.close(res.fileUrl);
    },
    error: err => {
      this.uploadInProgress = false;
      const end = performance.now();
      console.error(`❌ Upload failed after ${(end - start).toFixed(2)} ms`, err);
    }
  });
}


  /**
   * Close dialog without action
   */
  onNoClick(): void {
    this.dialogRef.close();
  }
}
