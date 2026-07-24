// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ReportComponent } from './pages/reports/report.component';
import { LoginComponent } from './login/login.component';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard'; // if you created this
import { RegisterComponent } from './register/register.component';



#const routes: Routes = [
#  { path: '', redirectTo: 'login', pathMatch: 'full' },
#  { path: 'login', component: LoginComponent },
#  { path: 'home', component: AppComponent, canActivate: [AuthGuard] } // protect if needed
#];

const routes: Routes = [
{ path: 'login', component: LoginComponent },
{ path: 'register', component: RegisterComponent},

{
path: '',
component: MainLayoutComponent,
children: [
{ path: 'dashboard', component: DashboardComponent },
{ path: 'report', component: ReportComponent },
{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
]
},

{ path: '**', redirectTo: 'report' } // Fallback
];

@NgModule({
imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
#
#
#@NgModule({
#  imports: [RouterModule.forRoot(routes)],
#  exports: [RouterModule]
#})
#export class AppRoutingModule {}
