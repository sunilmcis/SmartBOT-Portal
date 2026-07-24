import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';


@Component({
  selector: 'app-task-history-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatListModule],
  templateUrl: './task-history-dialog.component.html',
  styleUrls: ['./task-history-dialog.component.css']
})
export class TaskHistoryDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public history: any[]) {}
}
