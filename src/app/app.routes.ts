import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { Profile } from './features/profile/profile';
import { Register } from './features/register/register';
import { Login } from './features/login/login';
import { authGuard } from '@core/guards/auth-guard';
import { guestGuard } from '@core/guards/guest-guard';
import { Products } from './features/products/products';
import { TaxSettings } from './features/tax-settings/tax-settings';
import { Analyzer } from './features/analyzer/analyzer';

export const routes: Routes = [
  { 
    path: '', 
    component: Dashboard,
    canActivate: [authGuard] 
  },
  { 
    path: 'dashboard', 
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'analyzer',
    component: Analyzer,
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
  },
  {
    path: 'products',
    component: Products,
    canActivate: [authGuard]
  },
  {
    path: 'tax-settings',
    component: TaxSettings,
    canActivate: [authGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];