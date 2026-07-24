import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private msalService: MsalService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  loginWithMicrosoft() {

      this.msalService.loginRedirect();

  }
  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.value;
    this.isLoading = true;

    this.authService.login(username, password).subscribe({
      next: () => {
        console.log('✅ Login handled inside AuthService');
        this.snackBar.open('✅ Login successful', 'Close', { duration: 3000 });
       // this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err.message);
        this.snackBar.open(err.message || '❌ Login failed', 'Close', { duration: 3000 });
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    });
  }
}


// import { Component, OnInit } from '@angular/core';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
// import { AuthService } from '../services/auth.service';
// import { Router } from '@angular/router';
// import { MatSnackBar } from '@angular/material/snack-bar';
//
// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ReactiveFormsModule],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent implements OnInit {
//   loginForm!: FormGroup;
//   submitted = false;
//   isLoading = false;
//
//   constructor(
//     private authService: AuthService,
//     private router: Router,
//     private http: HttpClient,
//     private snackBar: MatSnackBar,
//     private fb: FormBuilder
//   ) {}
//
//   ngOnInit() {
//     this.loginForm = this.fb.group({
//       username: ['', Validators.required],
//       password: ['', Validators.required]
//     });
//   }
//
//   goToForgotPassword() {
//     this.router.navigate(['/forgot-password']);
//   }
//
//   goToRegister() {
//     this.router.navigate(['/register']);
//   }
//
//
//   // Called when form is submitted
//   onSubmit(): void {
//     this.submitted = true;
//
//     if (this.loginForm.invalid) {
//       return;
//     }
//
//     const { username, password } = this.loginForm.value;
//     this.isLoading = true;
//
//     this.authService.login(username, password).subscribe({
//       next: (response) => {
//         console.log('Login successful:', response);
//         localStorage.setItem('isLoggedIn', 'true');
//         localStorage.setItem('user', JSON.stringify(response.user));
//         this.authService.loadUserFromLocalStorage();
//         this.router.navigate(['/dashboard']);
//       },
//       error: (err) => {
//         console.error('Login failed:', err.message);
//         this.snackBar.open(err.message || 'Login failed', 'Close', { duration: 3000 });
//         this.isLoading = false;
//       }
//     });
//   }
// }
//
