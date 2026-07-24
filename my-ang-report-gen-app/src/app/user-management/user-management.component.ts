import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'employeeId', 'username', 'department', 'role', 'email', 'status', 'created_date', 'access', 'actions'
  ];

  searchValue: string = '';
  isLoading: boolean = false;
  totalUsers: number = 0;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      this.dataSource.data = [
        {
          emp_id: 'EMP001',
          first_name: 'Alice',
          dept: 'IT',
          role: 'Admin',
          email_address: 'alice@example.com',
          status: 'A',
          created_dt: new Date(),
          v_access: 'Grant',
        },
        {
          emp_id: 'EMP002',
          first_name: 'Bob',
          dept: 'Finance',
          role: 'User',
          email_address: 'bob@example.com',
          status: 'I',
          created_dt: new Date(),
          v_access: 'Revoke',
        }
      ];
      this.totalUsers = this.dataSource.data.length;
      this.isLoading = false;
    }, 1000);
  }

  toggleAccess(user: any, access: string) {
    user.v_access = access;
    console.log('Access changed for:', user.emp_id, '->', access);
  }

  resetPassword(user: any) {
    console.log('Reset password for:', user.emp_id);
  }

  openProfileDialog(user: any) {
    console.log('View profile for:', user.emp_id);
  }

  disableUser(user: any) {
    console.log('Disable user:', user.emp_id);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchValue = filterValue;
    this.dataSource.filter = this.searchValue;
  }

  clearSearch() {
    this.searchValue = '';
    this.dataSource.filter = '';
  }

  onPageChange(event: PageEvent) {
    console.log('Page changed:', event);
  }

  goToRegister() {
    console.log('Redirect to create user page');
  }
}
