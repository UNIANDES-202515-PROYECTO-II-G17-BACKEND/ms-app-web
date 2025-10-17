import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Solo acceder a localStorage en el navegador
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('access_token');

    if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq);
    }
  }

  return next(req);
};
