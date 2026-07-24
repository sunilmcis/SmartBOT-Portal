import {
  Component,
  HostListener,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  NavigationEnd,
  Router,
  RouterModule
} from '@angular/router';

import { filter } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../services/auth.service';

import {
  ProfilePictureDialogComponent
} from '../profile-picture-dialog/profile-picture-dialog.component';

interface SidebarGroups {
  automation: boolean;
  finance: boolean;
  hr: boolean;
  documents: boolean;
  administration: boolean;
}

interface SmartBotNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: string;
  read: boolean;
  route?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
  ],

  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  profileImageUrl: string | null = null;

  username: string | null = null;
  role: string | null = null;

  selectedTheme: 'light' | 'dark' = 'light';

  sidebarOpen = false;
  sidebarCollapsed = false;

  searchText = '';

  currentPageTitle = 'Dashboard';
  currentYear = new Date().getFullYear();

  expandedGroups: SidebarGroups = {
    automation: true,
    finance: false,
    hr: false,
    documents: false,
    administration: false
  };

  notifications: SmartBotNotification[] = [
    {
      id: 1,
      title: 'Document batch completed',
      message: 'Batch DOC-2026-00125 completed successfully.',
      time: '5 minutes ago',
      icon: 'check_circle',
      read: false,
      route: '/documents/generated'
    },
    {
      id: 2,
      title: 'BOT requires attention',
      message: 'One automation job completed with errors.',
      time: '24 minutes ago',
      icon: 'warning',
      read: false,
      route: '/automation/bot-monitor'
    },
    {
      id: 3,
      title: 'Tax invoice generated',
      message: 'The requested tax invoice is ready.',
      time: '1 hour ago',
      icon: 'receipt_long',
      read: true,
      route: '/finance/tax-invoice'
    }
  ];

  private readonly pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',

    '/report': 'Automation Reports',

    '/automation/document-generator':
      'Enterprise Document Generator',

    '/automation/pdf-editor':
      'SmartBOT PDF Editor',

    '/automation/bot-monitor':
      'BOT Monitoring',

    '/automation/scheduler':
      'BOT Scheduler',

    '/finance/group-billing':
      'Group Billing',

    '/finance/tax-invoice':
      'Tax Invoice',

    '/finance/payment-reports':
      'Payment Reports',

    '/hr/apply':
      'Apply',

    '/hr/my-requests':
      'My Requests',

    '/hr/manager-inbox':
      'Manager Inbox',

    '/hr/hr-inbox':
      'HR Inbox',

    '/task-board-move':
      'Task Management',

    '/documents/generated':
      'Generated Documents',

    '/documents/templates':
      'Template Management',

    '/documents/history':
      'Document History',

    '/reports':
      'Reports & Analytics',

    '/userMgmt':
      'User Management',

    '/admin/roles':
      'Role Management',

    '/admin/settings':
      'System Settings'
  };

  constructor(
    public authService: AuthService,
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.authService.loadUserFromLocalStorage();

    this.username = this.authService.getUsername();
    this.role = this.authService.getRole();

    this.profileImageUrl =
      this.authService.getProfilePictureUrl();

    this.loadSavedTheme();
    this.loadSavedSidebarState();
    this.updatePageTitle(this.router.url);

    this.router.events
      .pipe(
        filter(
          event => event instanceof NavigationEnd
        )
      )
      .subscribe(event => {
        const navigationEvent =
          event as NavigationEnd;

        this.updatePageTitle(
          navigationEvent.urlAfterRedirects
        );

        this.expandGroupForCurrentRoute(
          navigationEvent.urlAfterRedirects
        );

        this.closeSidebarOnMobile();
      });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.normalizedRole === 'admin';
  }

  get canViewDashboard(): boolean {
    return this.isAdmin ||
      this.normalizedRole === 'manager' ||
      this.normalizedRole === 'hr' ||
      this.normalizedRole === 'group user';
  }

  get canViewFinance(): boolean {
    return this.isAdmin ||
      this.normalizedRole === 'finance' ||
      this.normalizedRole === 'group user' ||
      this.normalizedRole === 'manager';
  }

  get canViewManagerInbox(): boolean {
    return this.isAdmin ||
      this.normalizedRole === 'manager';
  }

  get canViewHrInbox(): boolean {
    return this.isAdmin ||
      this.normalizedRole === 'hr';
  }

  get userInitial(): string {
    const value = this.username?.trim();

    if (!value) {
      return 'U';
    }

    return value.charAt(0).toUpperCase();
  }

  get unreadNotificationCount(): number {
    return this.notifications.filter(
      notification => !notification.read
    ).length;
  }

  private get normalizedRole(): string {
    return this.role?.trim().toLowerCase() ?? '';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth <= 1024) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebarCollapse(): void {
    this.sidebarCollapsed =
      !this.sidebarCollapsed;

    localStorage.setItem(
      'smartbot-sidebar-collapsed',
      String(this.sidebarCollapsed)
    );
  }

  toggleGroup(
    group: keyof SidebarGroups
  ): void {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;

      localStorage.setItem(
        'smartbot-sidebar-collapsed',
        'false'
      );

      this.expandedGroups[group] = true;
      return;
    }

    this.expandedGroups[group] =
      !this.expandedGroups[group];
  }

  isGroupExpanded(
    group: keyof SidebarGroups
  ): boolean {
    return this.expandedGroups[group];
  }

  performSearch(): void {
    const value =
      this.searchText.trim().toLowerCase();

    if (!value) {
      return;
    }

    const routeMap: Array<{
      keywords: string[];
      route: string;
    }> = [
      {
        keywords: [
          'document',
          'generator',
          'letter',
          'batch'
        ],
        route:
          '/automation/document-generator'
      },
      {
        keywords: [
          'pdf',
          'merge',
          'editor'
        ],
        route:
          '/automation/pdf-editor'
      },
      {
        keywords: [
          'billing',
          'group billing'
        ],
        route:
          '/finance/group-billing'
      },
      {
        keywords: [
          'tax',
          'invoice'
        ],
        route:
          '/finance/tax-invoice'
      },
      {
        keywords: [
          'user',
          'employee',
          'admin'
        ],
        route:
          '/userMgmt'
      },
      {
        keywords: [
          'task',
          'board'
        ],
        route:
          '/task-board-move'
      },
      {
        keywords: [
          'report',
          'analytics'
        ],
        route:
          '/reports'
      }
    ];

    const match = routeMap.find(item =>
      item.keywords.some(keyword =>
        value.includes(keyword)
      )
    );

    if (match) {
      this.router.navigate([match.route]);
      this.searchText = '';
    }
  }

  clearSearch(): void {
    this.searchText = '';
  }

  markAllNotificationsRead(
    event: Event
  ): void {
    event.stopPropagation();

    this.notifications =
      this.notifications.map(notification => ({
        ...notification,
        read: true
      }));
  }

  openNotification(
    notification: SmartBotNotification
  ): void {
    notification.read = true;

    if (notification.route) {
      this.router.navigate([
        notification.route
      ]);
    }
  }

  toggleTheme(): void {
    this.selectedTheme =
      this.selectedTheme === 'dark'
        ? 'light'
        : 'dark';

    this.applyTheme();
  }

  applyTheme(): void {
    document.body.classList.remove(
      'light-theme',
      'dark-theme'
    );

    document.body.classList.add(
      `${this.selectedTheme}-theme`
    );

    localStorage.setItem(
      'smartbot-theme',
      this.selectedTheme
    );
  }

  refreshProfilePicture(): void {
    this.profileImageUrl =
      this.authService.getProfilePictureUrl();
  }

  openProfilePictureDialog(): void {
    const dialogRef = this.dialog.open(
      ProfilePictureDialogComponent,
      {
        width: '480px',
        maxWidth: '95vw',
        disableClose: false
      }
    );

    dialogRef
      .afterClosed()
      .subscribe((result: string | null) => {
        if (result) {
          this.refreshProfilePicture();
        }
      });
  }

  onFileSelected(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.previewUrl = reader.result;
    };

    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    if (
      !this.selectedFile ||
      !this.username
    ) {
      return;
    }

    const formData = new FormData();

    formData.append(
      'username',
      this.username
    );

    formData.append(
      'profilePicture',
      this.selectedFile
    );

    this.http
      .post<{
        fileUrl: string;
      }>(
        'http://localhost:3017/api/upload-profile-picture',
        formData
      )
      .subscribe({
        next: response => {
          const fileName =
            response.fileUrl
              .split('/')
              .pop();

          if (fileName) {
            this.authService
              .setProfilePicture(fileName);
          }

          this.refreshProfilePicture();
        },

        error: error => {
          console.error(
            'Profile picture upload failed:',
            error
          );
        }
      });
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener(
    'window:resize',
    ['$event']
  )
  onWindowResize(): void {
    if (window.innerWidth > 1024) {
      this.sidebarOpen = false;
    }
  }

  private loadSavedTheme(): void {
    const savedTheme =
      localStorage.getItem(
        'smartbot-theme'
      );

    if (
      savedTheme === 'light' ||
      savedTheme === 'dark'
    ) {
      this.selectedTheme =
        savedTheme;
    }

    this.applyTheme();
  }

  private loadSavedSidebarState(): void {
    const savedState =
      localStorage.getItem(
        'smartbot-sidebar-collapsed'
      );

    this.sidebarCollapsed =
      savedState === 'true';
  }

  private updatePageTitle(
    url: string
  ): void {
    const cleanUrl =
      url.split('?')[0].split('#')[0];

    const matchedRoute =
      Object.keys(this.pageTitles)
        .find(route =>
          cleanUrl === route ||
          cleanUrl.startsWith(`${route}/`)
        );

    this.currentPageTitle =
      matchedRoute
        ? this.pageTitles[matchedRoute]
        : 'SmartBOT';
  }

  private expandGroupForCurrentRoute(
    url: string
  ): void {
    if (url.startsWith('/automation') ||
        url.startsWith('/report')) {
      this.expandedGroups.automation = true;
    }

    if (url.startsWith('/finance')) {
      this.expandedGroups.finance = true;
    }

    if (url.startsWith('/hr')) {
      this.expandedGroups.hr = true;
    }

    if (url.startsWith('/documents')) {
      this.expandedGroups.documents = true;
    }

    if (
      url.startsWith('/admin') ||
      url.startsWith('/userMgmt')
    ) {
      this.expandedGroups.administration = true;
    }
  }
}
