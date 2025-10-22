import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Solo verificar token en el navegador, no en el servidor
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('access_token');

    if (token) {
      return true; // Permitir acceso
    }
  }

  // Redirigir al login si no hay token o estamos en servidor
  router.navigate(['/login']);
  return false;
};
