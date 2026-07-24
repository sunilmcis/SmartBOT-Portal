import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  passwordMismatch = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['', Validators.required],
      department: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rPassword: ['', Validators.required]
    });
  }

  // Helper to easily access form controls in template
  get f(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    // Password match validation
    if (this.f['password'].value !== this.f['rPassword'].value) {
      this.passwordMismatch = true;
      return;
    } else {
      this.passwordMismatch = false;
    }

    if (this.registerForm.invalid) {
      return;
    }

    const formData = {
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      role: this.f['role'].value,
      department: this.f['department'].value,
      email: this.f['email'].value,
      phoneNumber: this.f['phone'].value,
      password: this.f['password'].value
    };

    this.http.post('http://localhost:3017/api/register', formData).subscribe({
      next: () => {
        alert('Registration successful');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert('Registration failed: ' + err.error?.message || err.message);
      }
    });
  }
}


// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
//
// @Component({
//   selector: 'app-register',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './register.component.html',
//   styleUrl: './register.component.css'
// })
// export class RegisterComponent {
//   registerForm: FormGroup;
//
//   constructor(private fb: FormBuilder, private http: HttpClient) {
//     this.registerForm = this.fb.group({
//       firstName: ['', Validators.required],
//       lastName: ['', Validators.required],
//       role: ['', Validators.required],
//       department: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       phone: ['', Validators.required],
//       password: ['', Validators.required]
//
//     });
//   }
//
// //   onSubmit() {
// //     if (this.registerForm.valid) {
// //       this.http.post('http://localhost:3017/api/customers', this.registerForm.value).subscribe({
// //         next: () => alert('Customer Registered Successfully'),
// //         error: (err) => alert('Error: ' + err.message)
// //       });
// //     }
// //   }
//
// onSubmit() {
//   if (this.registerForm.valid) {
//     this.http.post('http://localhost:3017/api/register', this.registerForm.value).subscribe({
//       next: () => alert('User registered successfully'),
//       error: (err) => alert('Error registering user: ' + err.message)
//     });
//   }
// }
//
//
// }
