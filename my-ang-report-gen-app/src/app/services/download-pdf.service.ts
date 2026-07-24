// zip-download.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
providedIn: 'root',
})
export class PdfDownloadService {
private pdfUrl = 'http://localhost:3017/api/download-pdf-latest';

constructor(private http: HttpClient) {}

  pdfDownload(): Observable<Blob> {
    return this.http.get(this.pdfUrl, { responseType: 'blob' });
  }
}
