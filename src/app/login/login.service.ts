import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { LoginRequest, LoginResponse, User } from './login.interface';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor() { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🚀 Enviando petición de login:', credentials);

    // Datos mock del usuario
    const mockUser: User = {
      id: 1,
      nombre: 'Usuario Demo MediSupply',
      email: 'demo@medisupply.com',
      role: 'admin',
      avatar: '/images/default-avatar.png'
    };

    // Simulamos una petición HTTP con delay
    const mockResponse: LoginResponse = {
      success: true,
      token: 'mock-jwt-token-123456789',
      user: mockUser,
      message: 'Autenticación exitosa'
    };

    console.log('✅ Respuesta del servidor (simulada):', mockResponse);

    // Simulamos 1 segundo de delay para mostrar el loading
    return of(mockResponse).pipe(delay(1000));
  }
}
