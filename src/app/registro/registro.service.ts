import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroRequest, RegistroResponse } from './registro.interface';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  constructor(private http: HttpClient) { }

  registro(data: RegistroRequest): Observable<RegistroResponse> {
    console.log('🚀 Enviando petición de registro:', data);

    return this.http.post<RegistroResponse>('https://medisupply-gw-5k2l9pfv.uc.gateway.dev/v1/auth/register', data, {
      headers: {
        'X-Country': 'mx',
        'Content-Type': 'application/json'
      }
    });
  }
}
