import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reset-password-reminder.component.html'
})
export class ResetPasswordReminderComponent {
  constructor(private router: Router) {}

  proceedToReset() {
    this.router.navigate(['/auth/reset-password']);
  }

  skip() {
    this.router.navigate(['/dashboard']);
  }
}
