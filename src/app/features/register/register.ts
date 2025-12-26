import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  step = 1; 
  showPassword = false;

  userData = {
    nomeResponsavel: '',
    email: '',
    senha: '',
    nomeLoja: '',
    cnpj: '',
    termos: false
  };

  constructor(private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Cadastrando usuário no Zero Loss:', this.userData);
    alert('Conta criada com sucesso! Redirecionando...');
    this.router.navigate(['/dashboard']);
  }
}