import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Router } from '@angular/router'; // ✅ Add this import

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3017/api';
  private currentUser: any = null;

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromLocalStorage();
  }
  //const userRole  = localStorage.getItem('role');
//   login(username: string, password: string): Observable<any> {
//     return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
//       tap(response => {
//         //added for password reset if password expire
//         if (response.needsPasswordReset) {
//             this.router.navigate(['/auth/reset']);
//           } else {
//             this.router.navigate(['/dashboard']);
//           }
//         //end added for password reset if password expire
//
//         this.currentUser = {
//           username: response.user.username,
//           email: response.user.email,
//           role: response.user.role,
//           profilePicture: response.user.profilePicture // this should be the filename or null
//         };
//       console.log('response.user.role',response.user.role);
//       console.log('this.currentUser.role ',this.currentUser.role);
//         localStorage.setItem('user', JSON.stringify(this.currentUser));
//       }),
//       catchError(err => throwError(() => new Error(err.error?.message || 'Login failed')))
//     );
//   }


 login(username: string, password: string): Observable<any> {
   return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
     tap(response => {
       console.log('🟨 Login Response:', response);
         console.log('🟩 Role from server:', response.user.role);
       if (response.needsPasswordReset) {
         this.router.navigate(['/auth/reset']);
       } else {
         const role = response.user.role;
         if (role?.toLowerCase() === 'admin') {
           console.log('Routing to /dashboard' );
           this.router.navigate(['/dashboard']);
         } else {
            console.log('Routing to /report' );
           this.router.navigate(['/report']);
         }

       }

       this.currentUser = {
         username: response.user.username,
         email: response.user.email,
         role: response.user.role,
         profilePicture: response.user.profilePicture
       };

       console.log('response.user.role', response.user.role);
       localStorage.setItem('user', JSON.stringify(this.currentUser));
     }),
     catchError(err => throwError(() => new Error(err.error?.message || 'Login failed')))
   );
 }


  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!this.getUsername();
  }

  getUsername(): string | null {
    if (!this.currentUser) this.loadUserFromLocalStorage();
    return this.currentUser?.username || null;
  }



  getUser(): any {
    if (!this.currentUser) this.loadUserFromLocalStorage();
    return this.currentUser;
  }

  setProfilePicture(filename: string): void {
    if (this.currentUser) {
      this.currentUser.profilePicture = filename;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  }

  /**
   * Returns profile picture full URL or null if not set.
   * Auto-refreshes with a timestamp to avoid browser cache issues.
   */
//   getProfilePictureUrl(): string | null {
//     if (!this.currentUser) this.loadUserFromLocalStorage();
//     if (!this.currentUser?.profilePicture) return null;
//    // return `http://localhost:3017/uploads/${this.currentUser.profilePicture}?t=${Date.now()}`;
//     return `http://localhost:3017/uploads/${this.currentUser.profilePicture}`;
//   }

  getProfilePictureUrl(): string | null {
    if (!this.currentUser) this.loadUserFromLocalStorage();
    const pic = this.currentUser?.profilePicture;
    if (!pic) return null;

    // If full URL is already present, return as-is
    if (pic.startsWith('http://') || pic.startsWith('https://')) {
      return pic;
    }

    // Otherwise, construct the full URL
    console.log('getProfilePictureUrl',this.getRole());
    return `http://localhost:3017/uploads/${pic}`;
  }



  loadUserFromLocalStorage(): void {
    const savedUser = localStorage.getItem('user');

    try {
      this.currentUser = savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      this.currentUser = null;
    }
  }

 getRole(): string | null {
   if (!this.currentUser) this.loadUserFromLocalStorage();
   return this.currentUser?.role || null;
 }

}
