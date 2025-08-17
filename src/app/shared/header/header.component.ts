import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { IonicModule } from '@ionic/angular';
import { ThemeService } from '../../core/services/theme.service';

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
  private themeSub!: Subscription;

  navItems = [
    { name: 'Inicio', href: '/dashboard', icon: 'home' },
    { name: 'Diagnóstico', href: '/diagnostic', icon: 'brain' },
    { name: 'Quiz', href: '/quiz', icon: 'book' },
    { name: 'Estadísticas', href: '/stats', icon: 'stats-chart' },
  ];

  constructor(private router: Router, private themeService: ThemeService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.url;
      this.isAuthenticated = this.currentPath !== '/login' && this.currentPath !== '/';
    });
    // Subscribe to theme changes
    this.themeSub = this.themeService.darkMode$.subscribe(dark => {
      this.darkMode = dark;
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
  }

  handleScroll() {
    this.isScrolled = window.scrollY > 10;
  }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  logout() {
    // Implementar lógica de cierre de sesión
    this.router.navigate(['/login']);
  }
}
