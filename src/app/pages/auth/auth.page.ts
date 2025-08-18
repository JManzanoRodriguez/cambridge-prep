import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, IonicModule } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, IonicModule]
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
    private toastController: ToastController,
    private authService: AuthService
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

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: async (user) => {
        await this.presentToast(`¡Bienvenido/a ${user.name}!`, 'success');
        // Pequeño delay para asegurar que el estado se actualice
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
        this.isLoading = false;
      },
      error: async (error) => {
        console.error('Error de login:', error);
        await this.presentToast(error.message || 'Error al iniciar sesión', 'danger');
        this.isLoading = false;
      }
    });
  }

  async onRegisterSubmit() {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;

    const { name, email, password } = this.registerForm.value;

    this.authService.register(name, email, password).subscribe({
      next: async (user) => {
        await this.presentToast(`¡Cuenta creada exitosamente! Bienvenido/a ${user.name}!`, 'success');
        // Pequeño delay para asegurar que el estado se actualice
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
        this.isLoading = false;
      },
      error: async (error) => {
        console.error('Error de registro:', error);
        await this.presentToast(error.message || 'Error al crear la cuenta', 'danger');
        this.isLoading = false;
      }
    });
  }

  async handleSocialLogin(provider: string) {
    await this.presentToast(`Login con ${provider} no implementado aún`, 'warning');
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
