import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [IonicModule, RouterModule],
  standalone: true,
})
export class SidebarComponent {
  currentPath = '';
  isAuthenticated = false;
  currentUser: User | null = null;

  navItems = [
    { name: 'Inicio', href: '/dashboard', icon: 'home' },
    { name: 'Diagnóstico', href: '/diagnostic', icon: 'brain' },
    { name: 'Quiz', href: '/quiz', icon: 'book' },
    { name: 'Estadísticas', href: '/stats', icon: 'stats-chart' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.url;
    });

    // Subscribe to authentication changes
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
  }
}
