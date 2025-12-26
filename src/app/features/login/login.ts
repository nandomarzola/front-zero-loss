import { Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  encapsulation: ViewEncapsulation.None
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = false;
  isLoading = signal(false);
  loginData = {
    identifier: '',
    senha: '',
    lembrar: false
  };

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    this.isLoading.set(true);
    try {
      await this.authService.login({
        identifier: this.loginData.identifier, 
        password: this.loginData.senha
      });
      console.log('✅ Login realizado com sucesso!');
    } catch (error: any) {
      alert('Erro ao logar. Verifique suas credenciais.');
    } finally {
      this.isLoading.set(false);
    }
  }
}