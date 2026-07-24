// task-board.component.ts — Modified for Trello-style features

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, transferArrayItem, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskService } from '../services/task.service';
import { MatCard } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskHistoryDialogComponent } from './task-history-dialog/task-history-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { EditTaskDialogComponent } from './edit-task-dialog/edit-task-dialog.component';
import { TaskDetailsDialogComponent } from './task-details-dialog/task-details-dialog.component';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCard,
    FormsModule,
    TaskHistoryDialogComponent,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatIconModule,
    EditTaskDialogComponent,
    TaskDetailsDialogComponent

  ],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css']
})
export class TaskBoardMoveComponent implements OnInit {
  statuses = [
    'To Do', 'Requirements', 'On Hold', 'Vendor Assessment',
    'Dev', 'UAT', 'Prod Preparation', 'Post Prod Signoff',
    'Invoicing', 'Done', 'Cancelled'
  ];

  @Input() task: any;

  constructor(
    private http: HttpClient,
    private taskService: TaskService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  private api = 'http://localhost:3017/api';

  tasks: { [key: string]: any[] } = {};
  connectedDropLists: string[] = [];
  openedListActions: string | null = null;

  listColors = [
    '#2ecc71', '#f1c40f', '#f39c12', '#e74c3c',
    '#9b59b6', '#3498db', '#5dade2', '#82e0aa',
    '#e67e22', '#d2527f', '#7f8c8d'
  ];

  listColorsByStatus: { [key: string]: string } = {};
  editedTask: any = null;
  hoveredTask: number | null = null;

  ngOnInit(): void {
    const savedTasks = localStorage.getItem('taskData');
    const savedColors = localStorage.getItem('listColors');

    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    } else {
      this.statuses.forEach(status => {
        this.tasks[status] = [];
      });

      this.taskService.getBoardTasks().subscribe(data => {
        for (const task of data) {
          if (!this.tasks[task.status]) {
            this.tasks[task.status] = [];
          }
          this.tasks[task.status].push(task);
        }
        this.saveTasksToLocalStorage();
      });
    }

    if (savedColors) {
      this.listColorsByStatus = JSON.parse(savedColors);
    }

    this.connectedDropLists = this.statuses.map(status => this.getDropListId(status));
  }

  drop(event: CdkDragDrop<any[]>, status: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    const movedTask = event.container.data[event.currentIndex];
    movedTask.status = status;
    this.saveTasksToLocalStorage();

    if (movedTask.id) {
      this.taskService.updateBoardTask(movedTask.id, {
        title: movedTask.title,
        description: movedTask.description,
        status: status,
        color: movedTask.color,
        updated_by: this.authService.getUser()?.email || 'admin@example.com'
      }).subscribe();
    }
  }

  openAddTaskDialog(status: string) {
    const title = prompt(`Enter task title for "${status}":`);
    if (title) {
      const newTask = { title, description: '', status, due_date: new Date() };
      this.taskService.createBoardTask(newTask).subscribe(savedTask => {
        this.tasks[status].push(savedTask);
        this.saveTasksToLocalStorage();
      });
    }
  }

  toggleListActions(status: string) {
    this.openedListActions = this.openedListActions === status ? null : status;
  }

  addCard(status: string) {
    this.openAddTaskDialog(status);
  }

  copyList(status: string) {
    const copiedTasks = this.tasks[status].map(task => ({ ...task, title: task.title + ' (copy)' }));
    this.tasks[status].push(...copiedTasks);
    this.saveTasksToLocalStorage();
  }

  moveList(status: string) {
    const targetStatus = prompt('Enter target list to move all cards to:');
    if (targetStatus && this.statuses.includes(targetStatus)) {
      this.tasks[targetStatus].push(...this.tasks[status]);
      this.tasks[status] = [];
      this.saveTasksToLocalStorage();
    }
  }

  sortBy(status: string) {
    this.tasks[status].sort((a, b) => a.title.localeCompare(b.title));
    this.saveTasksToLocalStorage();
  }

  watchList(status: string) {
    alert(`You're now watching the "${status}" list.`);
  }

  changeListColor(status: string, color: string) {
    this.listColorsByStatus[status] = color;
    this.saveColorsToLocalStorage();
    this.openedListActions = null;

    for (const task of this.tasks[status]) {
      if (task.id) {
        this.taskService.updateBoardTask(task.id, {
          color,
          updated_by: this.authService.getUser()?.email || 'admin@example.com'
        }).subscribe();
      }
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getDropListId(status: string): string {
    return `cdk-drop-${this.getStatusClass(status)}`;
  }

  saveTasksToLocalStorage() {
    localStorage.setItem('taskData', JSON.stringify(this.tasks));
  }

  saveColorsToLocalStorage() {
    localStorage.setItem('listColors', JSON.stringify(this.listColorsByStatus));
  }

  editTaskTitle(task: any): void {
    this.editedTask = task;
  }

  saveTaskTitle(task: any): void {
    this.editedTask = null;
  }

  watchTask(task: any) {
    alert(`Watching task: ${task.title}`);
  }

  setDueDate(task: any) {
    task.due_date = new Date();
  }

  viewDescription(task: any) {
    alert(`Description for: ${task.title}`);
  }

  viewHistory(task: any) {
    this.taskService.getTaskHistory(task.id).subscribe(history => {
      this.dialog.open(TaskHistoryDialogComponent, {
        width: '500px',
        data: history
      });
    });
  }

  openEditDialog(task: any) {
    this.dialog.open(EditTaskDialogComponent, {
      width: '400px',
      data: task
    });
  }

  createBoardTask(task: any): Observable<any> {
    return this.http.post<any>(`${this.api}/ins-tasks-board`, task);
  }

  updateBoardTaskStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.api}/tasks-board/${id}`, { status });
  }

  updateBoardTask(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/tasks-board/${id}`, data);
  }

  openTaskDetailsDialog(task: any): void {
    this.dialog.open(TaskDetailsDialogComponent, {
     width: '1100px',
       maxWidth: 'none',                // IMPORTANT: override Angular Material's default 80vw
       panelClass: 'wide-dialog-panel', // Custom class
       data: task
    });
  }

}
