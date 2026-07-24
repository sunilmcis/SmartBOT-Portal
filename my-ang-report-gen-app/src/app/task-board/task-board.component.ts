// board.component.ts
import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-board',
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css'],
  imports: [DragDropModule]
})
export class TaskBoardComponent implements OnInit {
  tasks: any[] = [];
  columns = ['To Do', 'Hold', 'In Progress', 'Done'];
  columnTasks: { [key: string]: any[] } = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchTasks();
  }

  fetchTasks() {
    this.http.get<any[]>('http://localhost:3017/api/tasks-board').subscribe(data => {
      this.columns.forEach(col => this.columnTasks[col] = []);
      data.forEach(task => this.columnTasks[task.status]?.push(task));
    });
  }

//   drop(event: CdkDragDrop<any[]>, newStatus: string) {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       const task = event.previousContainer.data[event.previousIndex];
//       this.http.put(`http://localhost:3017/api/tasks-board/${task.id}`, { status: newStatus }).subscribe(() => {
//         transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
//       });
//     }
//   }

  drop(event: CdkDragDrop<any[]>, newStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      this.http.put(`http://localhost:3017/api/tasks/${task.id}`, { status: newStatus }).subscribe(() => {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      });
    }
  }
}
