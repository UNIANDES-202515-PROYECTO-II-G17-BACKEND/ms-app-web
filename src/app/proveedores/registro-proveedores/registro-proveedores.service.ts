import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProveedorRequest, ProveedorResponse } from './registro-proveedores.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistroProveedoresService {

  constructor(private http: HttpClient) { }

  registrarProveedor(data: ProveedorRequest): Observable<ProveedorResponse> {
    console.log('Registrando proveedor con datos:', data);
    return this.http.post<ProveedorResponse>(`${environment.apiUrl}/proveedores`, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Country': 'co'
      }
    });
  }
}
