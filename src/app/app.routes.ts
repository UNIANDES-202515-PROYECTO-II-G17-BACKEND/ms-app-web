import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.component').then(m => m.RegistroComponent)
  },
  // TODO: Agregar ruta /home cuando esté lista
  // { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: '**', redirectTo: '/login' }
];
