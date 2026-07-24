// zip-download.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
providedIn: 'root',
})
export class ZipDownloadService {
private zipUrl = 'http://localhost:3017/api/download-zip';

constructor(private http: HttpClient) {}

  downloadZip(): Observable<Blob> {
    return this.http.get(this.zipUrl, { responseType: 'blob' });
  }
}
