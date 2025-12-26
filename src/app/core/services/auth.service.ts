import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthApiService } from './api/auth-api.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authApi = inject(AuthApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  user = signal<any>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user_data');
      
      if (token && savedUser) {
        this.isAuthenticated.set(true);
        this.user.set(JSON.parse(savedUser));
      }
    }
  }

  async login(credentials: any): Promise<boolean> { 
    try {
      const res = await firstValueFrom(this.authApi.login(credentials));
      const token = res.data?.access_token;
      const userData = res.data;

      if (token) {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', token);
          localStorage.setItem('user_data', JSON.stringify(userData));
        }
        
        this.user.set(userData);
        this.isAuthenticated.set(true);
        
        await this.router.navigate(['/dashboard']);
        return true; 
      }

      return false;
      
    } catch (error) {
      console.error('Erro no processo de login:', error);
      throw error;
    }
  }

  async register(userData: any) {
    try {
      await firstValueFrom(this.authApi.register(userData));
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
    }

    this.isAuthenticated.set(false);
    this.user.set(null);

    this.router.navigate(['/login']);
  }
}