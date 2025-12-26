import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { Analisador } from './features/analisador/analisador';
import { Profile } from './features/profile/profile';
import { Register } from './features/register/register';
import { Login } from './features/login/login';

export const routes: Routes = [
  { 
    path: '', 
    component: Dashboard 
  },
  { 
    path: 'dashboard', 
    component: Dashboard 
  },
  {
    path: 'analisador',
    component: Analisador
  },
  {
    path: 'profile',
    component: Profile
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'login',
    component: Login
  }
];

