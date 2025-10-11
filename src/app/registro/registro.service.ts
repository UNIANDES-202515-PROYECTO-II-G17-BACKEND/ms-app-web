import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { RegistroRequest, RegistroResponse } from './registro.interface';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  constructor() { }

  registro(data: RegistroRequest): Observable<RegistroResponse> {
    console.log('🚀 Enviando petición de registro:', data);

    // Simulamos una petición HTTP con delay
    const mockResponse: RegistroResponse = {
      success: true,
      message: 'Registro exitoso. ¡Bienvenido a MediSupply!',
      userId: 123,
      token: 'mock-registration-token-987654321'
    };

    console.log('✅ Respuesta del servidor (simulada):', mockResponse);

    // Simulamos 1.5 segundos de delay para mostrar el loading
    return of(mockResponse).pipe(delay(1500));
  }
}
