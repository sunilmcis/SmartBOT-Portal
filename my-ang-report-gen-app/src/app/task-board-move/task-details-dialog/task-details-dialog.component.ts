import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-task-details-dialog',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './task-details-dialog.component.html',
  styleUrls: ['./task-details-dialog.component.css']
})
export class TaskDetailsDialogComponent {
  showAddMenu = false;
  newComment: string = '';
  defaultAvatar = 'assets/default-avatar.png';

  constructor(
    public dialogRef: MatDialogRef<TaskDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    data.activity = [
      {
        author: 'Alice',
        time: new Date(),
        text: 'changed status from "To Do" to "In Progress"',
        type: 'status-change',
        avatar: 'assets/avatar-alice.png'
      },
      {
        author: 'Bob',
        time: new Date(),
        text: 'added a new checklist "QA Checks"',
        type: 'checklist',
        avatar: 'assets/avatar-bob.png'
      },
      {
        author: 'You',
        time: new Date(),
        text: 'Great job team!',
        type: 'comment',
        avatar: 'assets/default-avatar.png'
      }
    ];

    }

  close(): void {
    this.dialogRef.close();
  }

//   postComment() {
//     if (this.newComment.trim()) {
//       const newEntry = {
//         author: 'You',
//         time: new Date(),
//         text: this.newComment,
//         avatar: this.defaultAvatar
//       };
//       this.data.comments = this.data.comments || [];
//       this.data.comments.unshift(newEntry);
//       this.newComment = '';
//     }
//   }

postComment() {
  if (this.newComment.trim()) {
    const newEntry = {
      author: 'You',
      time: new Date(),
      text: this.newComment,
      avatar: this.defaultAvatar,
      type: 'comment'
    };
    this.data.activity = this.data.activity || [];
    this.data.activity.unshift(newEntry);
    this.newComment = '';
  }
}

getActivityIcon(type: string): string {
  switch (type) {
    case 'comment': return 'chat';
    case 'status-change': return 'sync';
    case 'checklist': return 'check_circle';
    case 'attachment': return 'attach_file';
    case 'member': return 'person_add';
    case 'label': return 'label';
    case 'due-date': return 'event';
    default: return 'info';
  }
}

}
