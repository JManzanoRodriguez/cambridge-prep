import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, IonicModule, RouterModule, NgIf, NgFor],
  standalone: true,
})
export class SidebarComponent {
  currentPath = '';
  isAuthenticated = false;

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
  }

  logout() {
    // Implementar lógica de cierre de sesión
    this.router.navigate(['/login']);
  }
}
