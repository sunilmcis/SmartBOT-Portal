import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3005/api/first-table';//http://localhost:3000/api/data';

  constructor(private http: HttpClient) { }

  //getData(): Observable<any[]> {
  //  return this.http.get<any[]>(this.apiUrl);
  //}
  getData() {
       return this.http.get<any[]>(this.apiUrl);
  }

//getData() {
//  return this.http.get<any[]>('https://cors-anywhere.herokuapp.com/https://your-api-url.com/data');
//}
}
