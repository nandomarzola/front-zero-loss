import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  step = 1; 
  showPassword = false;
  isLoading = signal(false);
  userData = {
    nomeResponsavel: '',
    email: '',
    senha: '',
    nomeLoja: '',
    cnpj: '',
    termos: false
  };

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (!this.userData.termos) {
      alert('Você precisa aceitar os termos.');
      return;
    }

    this.isLoading.set(true);

    const payload = {
      managerName: this.userData.nomeResponsavel,
      email: this.userData.email,
      password: this.userData.senha,
      shopName: this.userData.nomeLoja,
      taxId: this.userData.cnpj
    };

    try {
      await this.authService.register(payload);
      alert('Conta criada com sucesso! Faça login para continuar.');
      this.router.navigate(['/login']);
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Erro ao criar conta. Verifique os dados.';
      alert(errorMsg);
    } finally {
      this.isLoading.set(false);
    }
  }
}