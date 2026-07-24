// src/app/testing/task.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from './task.service';
import { Task } from './task.model';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task',
  standalone: true,
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class TaskComponent implements OnInit {
  tasks: Task[] = [];
  newTask: Task = {
    title: '',
    description: '',
    assigned_to: '',
    status: 'Pending',
    due_date: ''
  };

  constructor(private taskService: TaskService, private snackBar: MatSnackBar, private router: Router) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe((data: Task[]) => (this.tasks = data));
  }

  createTask() {
    this.taskService.createTask(this.newTask).subscribe(() => {
      this.snackBar.open('✅ Task Created', 'Close', { duration: 2000 });
      this.newTask = { title: '', description: '', assigned_to: '', status: 'Pending', due_date: '' };
      this.loadTasks();
    });
  }

  updateStatus(taskId: number, newStatus: string) {
    this.taskService.updateTaskStatus(taskId, newStatus).subscribe(() => {
      this.snackBar.open('✅ Status Updated', 'Close', { duration: 2000 });
      this.loadTasks();
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']); // or any route you want
  }
}
