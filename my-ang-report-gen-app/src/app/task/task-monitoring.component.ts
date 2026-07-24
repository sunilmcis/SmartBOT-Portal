import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-monitoring',
  standalone: true,
  templateUrl: './task-monitoring.component.html',
  styleUrls: ['./task-monitoring.component.css'],
  imports: [CommonModule, MatPaginatorModule, MatTableModule, MatButtonModule,MatCard]
})
export class TaskMonitoringComponent implements OnInit {
  displayedColumns = ['task_id', 'title', 'description', 'status_notes', 'attachment', 'status', 'created_at', 'updated_at', 'creator', 'assignee', 'rfa_number', 'target_completion_date'];
  dataSource = new MatTableDataSource<any>();
  totalItems = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadTasks(1);
  }

  loadTasks(page: number) {
    this.http.get<any>(`http://localhost:3017/api/tasks?page=${page}&limit=15`).subscribe(response => {
      this.dataSource.data = response.tasks;
      this.totalItems = response.total;
    });
  }

  onPageChange(event: PageEvent) {
    this.loadTasks(event.pageIndex + 1);
  }

  openCreateTaskDialog() {
    // You can later implement a dialog or route navigation here.
    //alert('Create Task clicked!');
      this.router.navigate(['/taskMgmt']);

    // this.router.navigate(['/create-task']); // If you want to route to a page
  }

}
