import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  private authService = inject(AuthService);
  
  private user = this.authService.user;

  showCurrentPassword = false;
  showNewPassword = false;

  
  userData = {
    storeName: this.user()?.shop_name || 'N/A',
    activeSince: this.user()?.created_at ? new Date(this.user()?.created_at).toLocaleDateString('pt-BR') : 'N/A',
    cnpj: this.user()?.cnpj || 'N/A',
    responsibleName: this.user()?.name || '',
    currentPassword: '',
    newPassword: ''
  };

  toggleCurrentPassword() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  saveProfile() {
    console.log('Enviando para o Laravel:', {
      name: this.userData.responsibleName,
      current_password: this.userData.currentPassword,
      new_password: this.userData.newPassword
    });
    
    alert('Alterações enviadas com sucesso!');
  }
}