import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  userData = {
    storeName: 'Minha Loja Oficial',
    activeSince: '15/10/2023',
    cnpj: '00.000.000/0001-00',
    responsibleName: 'João Silva',
    currentPassword: '',
    newPassword: ''
  };

  showCurrentPassword = false;
  showNewPassword = false;

  toggleCurrentPassword() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }
  saveProfile() {
    console.log('Dados para salvar:', this.userData);
    alert('Alterações enviadas com sucesso!');
  }

}