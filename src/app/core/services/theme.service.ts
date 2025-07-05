
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  public darkMode$ = this.darkMode.asObservable();

  constructor() {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('darkMode');
    if (storedTheme) {
      this.darkMode.next(storedTheme === 'true');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.darkMode.next(prefersDark.matches);
      
      // Listen for changes to the prefers-color-scheme media query
      prefersDark.addEventListener('change', (mediaQuery) => {
        this.setDarkMode(mediaQuery.matches);
      });
    }
    
    // Initialize theme
    this.updateTheme();
  }

  setDarkMode(isDark: boolean): void {
    this.darkMode.next(isDark);
    localStorage.setItem('darkMode', isDark.toString());
    this.updateTheme();
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.darkMode.value);
  }

  private updateTheme(): void {
    document.body.classList.toggle('dark', this.darkMode.value);
  }
}
