import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class AuthPage {
  segment = 'login';
  isLoading = false;
  
  loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  
  registerForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validator: this.passwordMatchValidator });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController
  ) {
    // Los formularios ya están inicializados
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  segmentChanged(event: any) {
    this.segment = event.detail.value;
  }

  async onLoginSubmit() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Login data:', this.loginForm.value);
      
      await this.presentToast('Inicio de sesión exitoso', 'success');
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Login error:', error);
      await this.presentToast('Error al iniciar sesión. Inténtalo de nuevo.', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async onRegisterSubmit() {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Register data:', this.registerForm.value);
      
      await this.presentToast('Registro exitoso. Bienvenido/a!', 'success');
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Register error:', error);
      await this.presentToast('Error al registrarse. Inténtalo de nuevo.', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async handleSocialLogin(provider: string) {
    this.isLoading = true;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`Login with ${provider}`);
      
      await this.presentToast(`Inicio de sesión con ${provider} exitoso`, 'success');
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error(`${provider} login error:`, error);
      await this.presentToast(`Error al iniciar sesión con ${provider}. Inténtalo de nuevo.`, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get loginEmail() { return this.loginForm.get('email'); }
  get loginPassword() { return this.loginForm.get('password'); }
  
  get registerName() { return this.registerForm.get('name'); }
  get registerEmail() { return this.registerForm.get('email'); }
  get registerPassword() { return this.registerForm.get('password'); }
  get registerConfirmPassword() { return this.registerForm.get('confirmPassword'); }
}
