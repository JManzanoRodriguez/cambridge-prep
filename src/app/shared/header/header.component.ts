import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, NgIf, NgFor, IonicModule, RouterModule],
  standalone: true,
})
export class HeaderComponent implements OnInit, OnDestroy {
  isScrolled = false;
  currentPath = '';
  isAuthenticated = false;
  darkMode = false;

  navItems = [
    { name: 'Inicio', href: '/dashboard', icon: 'home' },
    { name: 'Diagnóstico', href: '/diagnostic', icon: 'brain' },
    { name: 'Quiz', href: '/quiz', icon: 'book' },
    { name: 'Estadísticas', href: '/stats', icon: 'stats-chart' },
  ];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentPath = event.url;
      this.isAuthenticated = this.currentPath !== '/login' && this.currentPath !== '/';
    });

    // Check if dark mode is enabled
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.darkMode = prefersDark.matches;
    this.setTheme(this.darkMode);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (mediaQuery) => {
      this.darkMode = mediaQuery.matches;
      this.setTheme(this.darkMode);
    });
  }

  ngOnInit() {
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  handleScroll() {
    this.isScrolled = window.scrollY > 10;
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    this.setTheme(this.darkMode);
  }

  setTheme(dark: boolean) {
    document.body.classList.toggle('dark', dark);
  }

  logout() {
    // Implementar lógica de cierre de sesión
    this.router.navigate(['/login']);
  }
}
