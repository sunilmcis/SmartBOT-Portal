import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MainLayoutComponent } from './layout/main-layout.component';
//import { AuthService } from '../services/auth.service'; //public authService: AuthService
//
//
export const appRoutes: Routes = [

  //constructor( public authService: AuthService    ) {}


  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },

  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'report',
        loadComponent: () => import('./report/report.component').then(m => m.ReportComponent)
      },
      {
            path: 'reset',
              loadComponent: () => import('./password-reset/reset-password-reminder.component').then(m => m.ResetPasswordReminderComponent)


        },
      {
            path: 'userMgmt',
              loadComponent: () => import('./user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./password-reset/reset-password.component').then(m => m.ResetPasswordComponent)
      },
    {
            path: 'taskMgmt',
            loadComponent: () => import('./testing/task.component').then(m => m.TaskComponent)
          },
        {
                path: 'task-monitoring',
                loadComponent: () => import('./task/task-monitoring.component').then(m => m.TaskMonitoringComponent)
              },

            {
               path: 'task-board',
               loadComponent: () => import('./task-board/task-board.component').then(m => m.TaskBoardComponent)
             },

            {
               path: 'task-board-move',
               loadComponent: () => import('./task-board-move/task-board.component').then(m => m.TaskBoardMoveComponent)
            }


        // new
         // { path: 'resignation/apply', component: ResignationApplyComponent },
         // { path: 'resignation/my', component: ResignationMyListComponent },
         // { path: 'resignation/manager', component: ResignationManagerListComponent },
         // { path: 'resignation/hr', component: ResignationHrListComponent },



//      ,
//        { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
{
  path: '',
  component: MainLayoutComponent,

  children: [
    {
      path: 'finance/group-billing',

      loadComponent: () =>
        import(
          './Group-billing-layout/group-billing-layout.component'
        ).then(
          module =>
            module.GroupBillingLayoutComponent
        )
    }

    // Existing child routes remain here.
  ]
},
  { path: '**', redirectTo: 'login' }
];



// commented on 17072025 for  latest changes(adding customer registration page)
// export const appRoutes: Routes = [
// { path: '', redirectTo: 'login', pathMatch: 'full' },
// {
// path: 'login',
// loadComponent: () =>
//       import('./login/login.component').then(m => m.LoginComponent)
//   },
//   {
//     path: '',
//     loadComponent: () =>
//       import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
//     children: [
//       {
//         path: 'dashboard',
//         loadComponent: () =>
//           import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
//       },
//       {
//         path: 'report',
//         loadComponent: () =>
//           import('./report/report.component').then(m => m.ReportComponent)
//       },
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//     ]
//   },
//   { path: '**', redirectTo: 'dashboard' }
// ];
