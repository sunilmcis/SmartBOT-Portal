import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:3017/api/tasks';

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  updateTaskStatus(taskId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${taskId}/status`, { status });
  }

  // POST new task
  createBoardTask(task: any): Observable<any> {
    return this.http.post<any>('http://localhost:3017/api/ins-tasks-board', task);
  }

  // PUT update task status
  updateBoardTaskStatus(id: number, status: string): Observable<any> {
    return this.http.put(`http://localhost:3017/api/tasks-board/${id}`, { status });
  }

  // Optional: PUT update any field like color
  updateBoardTask(id: number, data: any): Observable<any> {
    return this.http.put(`http://localhost:3017/api/tasks-board/${id}`, data);
  }

getBoardTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tasks-board`);
  }

getTaskHistory(taskId: number) {
  return this.http.get<any[]>(`${this.apiUrl}/tasks-board/history/${taskId}`);
}


}
