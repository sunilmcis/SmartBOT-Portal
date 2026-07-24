import { Component, OnInit, Inject  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, ViewChild, ElementRef  } from '@angular/core';
import { ZipDownloadService } from '../services/zip-download.service';
import { PdfDownloadService } from '../services/download-pdf.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertDialogComponent } from '../alert-dialog.component'; // Adjust path

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, AlertDialogComponent],
  templateUrl: './report.component.html',
   styleUrls: ['./report.component.css']

})
export class ReportComponent implements OnInit {
  title = 'My Angular App';
  //items: any[] = [];
  items: { value: string, label: string }[] = [];
  parameters: any[] = [];
  //selectedCategory = '';
  noteContent = '';
  selectedCategory: string = ''; // Not an object, just a string


  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zipService: ZipDownloadService, private pdfService: PdfDownloadService, private snackBar: MatSnackBar,
  private dialog: MatDialog) {}

  triggerFileInput(): void {
      this.fileInput.nativeElement.click();
    }

  handleFileUpload(event: any): void {
      const file: File = event.target.files[0];
      if (file && file.type === 'application/pdf') {
        const formData = new FormData();
        formData.append('pdfFile', file);

        this.http.post('http://localhost:3017/api/upload-pdf', formData)
          .subscribe({
            next: () => alert('✅ PDF uploaded successfully'),
            error: () => alert('❌ Error uploading PDF')
          });
      } else {
        alert('❗ Please select a valid PDF file');
      }
    }


//   ngOnInit(): void {
//     this.http.get<any[]>(`http://localhost:3017/api/first-table`).subscribe(data => {
//       this.items = data.map((item: any[]) => ({ value: item[0], label: item[0] }));
//       console.log(this.items); // Log the dropdown data
//
//     });
//   }

//   ngOnInit(): void {
//     this.http.get<string[]>(`http://localhost:3017/api/first-table`).subscribe(data => {
//       //this.items = data.map((item: string) => ({ value: item, label: item }));
//       //console.log(this.items);
//       this.items = data.map((item: any) => ({
//         value: item.v_report_id,
//         label: item.v_report_desc
//        }));
//
//      console.log(this.items);
//
//     });
//   }

//items: { value: string, label: string }[] = [];
//selectedCategory: string = '';

// items: { value: string, label: string }[] = [];
// selectedCategory: string = '';

// ngOnInit(): void {
//   this.http.get<string[]>(`http://localhost:3017/api/first-table`).subscribe(data => {
//     this.items = data.map(item => ({
//       value: item,
//       label: item
//     }));
//     console.log('Items:', this.items);
//   });
// }
//
// items: { value: string, label: string }[] = [];
// selectedCategory: string = '';

ngOnInit(): void {
  this.http.get<any[]>(`http://localhost:3017/api/first-table`).subscribe(data => {
    this.items = data.map(item => ({
      value: item.v_report_id,
      label: item.v_report_id
    }));
    console.log('Items:', this.items); // Should show { value: '...', label: '...' }
  });
}




//   onCategoryChange(): void {
//     if (this.selectedCategory) {
//       this.http.get<any[]>(`http://localhost:3017/api/second-table?parentId=${this.selectedCategory}`).subscribe(data => {
//         this.parameters = data.map((param: any[]) => ({ value: param[0] }));
//       });
//     } else {
//       this.parameters = [];
//     }
//   }

onCategoryChange(): void {
     if (this.selectedCategory) {
       this.http.get<any[]>(`http://localhost:3017/api/second-table?reportId=${this.selectedCategory}`).subscribe(data => {
         this.parameters = data.map((param: any) => ({ value: param.parameter}));

       });
     } else {
       this.parameters = [];
     }
   }

  get parameterText(): string {
    return this.parameters?.map(p => p.value).join(', ') || '';
  }

  isSaveSuccessful: boolean = false;

saveNote(): void {
  const payload = {
    noteContent: this.noteContent,
    reportId: this.selectedCategory, // or use another selected field if applicable
    username: 'john.doe' // You can retrieve this from login context or user profile
  };
 // console.log('Sending payload:', payload); // 👈 Debug line
  this.http.post('http://localhost:3017/api/save-note', payload).subscribe({
    next: () => {
  //alert('Note saved successfully');
this.dialog.open(AlertDialogComponent, {
          data: { message: `✅ Note saved successfully` }
        });
                 this.isSaveSuccessful = true;
                 this.cdr.detectChanges(); // 👈 Force UI to update
                 },
    error: (err) => {
      //alert('Failed to save note: ' + err.message);
       this.dialog.open(AlertDialogComponent, {
          data: { message: `❌ Failed to save note: ${err?.error || err.message}` }
        });
     this.isSaveSuccessful = false;
     this.cdr.detectChanges(); // 👈 Force UI to update
     }
  });
}

isSubmitting: boolean = false;  // ✅ NEW

submitReport(): void {
this.isSubmitting = true;  // ✅ show spinner

  this.http.get('http://localhost:3017/api/run-python').subscribe({
    next: (response: any) => {
    //  alert('Submit successful: ' + JSON.stringify(response.message));
  //this.snackBar.open('✅ Submit successful: ' + response.message, 'Close', {
  //      duration: 4000,
  //      verticalPosition: 'bottom' // 'top' or 'bottom'
  //    });
  this.isSubmitting = false;  // ✅ hide spinner
  this.dialog.open(AlertDialogComponent, {
          data: { message: `✅ Submit successful: ${response.message}` }
        });

    },
    error: (err) => {
  //  console.error('Submit error response:', err);
  //  alert('Submit failed: ' + (err?.error || err.message));

  this.dialog.open(AlertDialogComponent, {
          data: { message: `❌ Submit failed: ${err?.error || err.message}` }
        });
    }
  });
}

download(): void {
    this.zipService.downloadZip().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'temp-folder.zip';
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
}
// process PDF
// processPDF(): void {
//
//
//   this.http.get('http://localhost:3017/api/run-python-PDF').subscribe({
//     next: (response: any) => {
//
//
//   this.dialog.open(AlertDialogComponent, {
//           data: { message: `✅ Process successful: ${response.message}` }
//         });
//
//     },
//     error: (err) => {
//           let errorMessage = 'Unknown error occurred';
//
//           if (typeof err?.error === 'string') {
//             errorMessage = err.error;
//           } else if (err?.error?.message) {
//             errorMessage = err.error.message;
//           } else if (typeof err?.error === 'object') {
//             errorMessage = JSON.stringify(err.error);
//           } else if (err?.message) {
//             errorMessage = err.message;
//           }
//
//           this.dialog.open(AlertDialogComponent, {
//             data: { message: `❌ Process failed: ${errorMessage}` }
//           });
//         }
//       });
//     }
//
downloadPdf(): void {
    this.pdfService.pdfDownload().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'processed-file'; //'temp-folder';
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
}
isProcessing: boolean = false;  // ✅ NEW
processPDF(): void {

  this.isProcessing = true;  // ✅ show spinner
  this.http.get('http://localhost:3017/api/run-python-PDF').subscribe({
    next: (response: any) => {
     this.isProcessing = false;  // ✅ hide spinner

   this.downloadPdf();
  this.dialog.open(AlertDialogComponent, {
          data: { message: `✅ Process successful: ${response.message}` }
        });

    },
    error: (err) => {
          let errorMessage = 'Unknown error occurred';

          if (typeof err?.error === 'string') {
            errorMessage = err.error;
          } else if (err?.error?.message) {
            errorMessage = err.error.message;
          } else if (typeof err?.error === 'object') {
            errorMessage = JSON.stringify(err.error);
          } else if (err?.message) {
            errorMessage = err.message;
          }

          this.dialog.open(AlertDialogComponent, {
            data: { message: `❌ Process failed: ${errorMessage}` }
          });
        }
      });
    }



// 🧩 History Logic

  fromDate: string = '';
  toDate: string = '';
  history: any[] = [];
  currentPage: number = 1;
  recordsPerPage: number = 20;
  filteredHistory: any[] = [];

  get paginatedHistory(): any[] {
    const start = (this.currentPage - 1) * this.recordsPerPage;
    return this.filteredHistory.slice(start, start + this.recordsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredHistory.length / this.recordsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  loadHistory(): void {
    this.http.get<any[]>(`http://localhost:3017/api/history`).subscribe(data => {
      this.history = data;
      this.filteredHistory = [...this.history];
    });
  }

  filterHistory(): void {
    if (!this.fromDate || !this.toDate) {
      this.filteredHistory = [...this.history];
      return;
    }

    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);

    this.filteredHistory = this.history.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= from && recordDate <= to;
    });
  }

uploadPdf(): void {
  // You can implement actual PDF upload logic here
  alert("Upload PDF button clicked!");
}

}

