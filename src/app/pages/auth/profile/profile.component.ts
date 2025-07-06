
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSlideToggleModule,
    MatButtonModule
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  darkMode = false;
  private themeSub!: Subscription;

  constructor(private formBuilder: FormBuilder, private themeService: ThemeService) {
    this.profileForm = this.formBuilder.group({
      name: ['John Doe', [Validators.required]],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      language: ['english'],
      notifications: [true]
    });
  }

  ngOnInit() {
    this.themeSub = this.themeService.darkMode$.subscribe(dark => {
      this.darkMode = dark;
    });
  }

  ngOnDestroy() {
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  saveProfile() {
    if (this.profileForm.valid) {
      console.log('Profile updated', this.profileForm.value);
      // In a real app, you would save the profile with a service
    }
  }
}
