
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  darkMode = false;

  constructor(private formBuilder: FormBuilder) {
    this.profileForm = this.formBuilder.group({
      name: ['John Doe', [Validators.required]],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      language: ['english'],
      notifications: [true]
    });
  }

  ngOnInit() {
    // Check system preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.darkMode = prefersDark.matches;
    
    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (mediaQuery) => {
      this.darkMode = mediaQuery.matches;
      this.updateTheme();
    });
    
    // Initialize theme
    this.updateTheme();
  }

  updateTheme() {
    document.body.classList.toggle('dark', this.darkMode);
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    this.updateTheme();
  }

  saveProfile() {
    if (this.profileForm.valid) {
      console.log('Profile updated', this.profileForm.value);
      // In a real app, you would save the profile with a service
    }
  }
}
