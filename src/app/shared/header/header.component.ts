import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { IonicModule } from '@ionic/angular';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonicModule, RouterModule],
  standalone: true,
})
export class HeaderComponent implements OnInit, OnDestroy {
  isScrolled = false;
  currentPath = '';
  isAuthenticated = false;
  darkMode = false;
  currentUser: User | null = null;
  private themeSub!: Subscription;
  private authSub!: Subscription;
  private userSub!: Subscription;

  navItems = [
    { name: 'Inicio', href: '/dashboard', icon: 'home' },
    { name: 'Diagnóstico', href: '/diagnostic', icon: 'brain' },
    { name: 'Quiz', href: '/quiz', icon: 'book' },
    { name: 'Estadísticas', href: '/stats', icon: 'stats-chart' },
  ];

  constructor(
    private router: Router, 
    private themeService: ThemeService,
    private authService: AuthService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.url;
    });
    
    // Subscribe to theme changes
    this.themeSub = this.themeService.darkMode$.subscribe(dark => {
      this.darkMode = dark;
    });

    // Subscribe to authentication changes
    this.authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      console.log('Header - Estado de autenticación:', isAuth);
    });

    // Subscribe to user changes
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Header - Usuario actual:', user?.name);
    });
  }

  ngOnInit() {
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.handleScroll.bind(this));
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  handleScroll() {
    this.isScrolled = window.scrollY > 10;
  }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  logout() {
    this.authService.logout();
  }
}
