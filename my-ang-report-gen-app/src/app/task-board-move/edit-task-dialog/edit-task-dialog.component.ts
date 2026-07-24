import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-task-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule],
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.css']
})
export class EditTaskDialogComponent {
  @Input() task: any;

  constructor(public dialogRef: MatDialogRef<EditTaskDialogComponent>) {}

  save() {
    this.dialogRef.close(this.task);
  }

  close() {
    this.dialogRef.close();
  }
}
