import { Component, inject, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  userData = this.authService.user; 
  
  isMenuOpen = false; 
  isAuthRoute = false;

  @HostListener('document:click')
  closeMenu() {
    this.isMenuOpen = false;
  }

  ngOnInit() {
    this.isMenuOpen = false;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isMenuOpen = false;

      const url = event.urlAfterRedirects || this.router.url;
      this.isAuthRoute = url.includes('/login') || url.includes('/register');
    });
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.isMenuOpen = false;
    this.authService.logout();
  }
}