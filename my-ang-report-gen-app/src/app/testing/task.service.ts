import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from './task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:3017/api/tasks';

  constructor(private http: HttpClient) {}

  getTasks() {
    return this.http.get<any[]>(this.apiUrl);
  }

  createTask(task: any) {
    return this.http.post(this.apiUrl, task);
  }

  updateTaskStatus(id: number, status: string) {
    return this.http.put(`${this.apiUrl}/${id}`, { status });
  }
}
