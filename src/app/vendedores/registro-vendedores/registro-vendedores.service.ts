import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VendedorRequest, VendedorResponse } from './registro-vendedores.interface';

@Injectable({
  providedIn: 'root'
})
export class RegistroVendedoresService {
  private apiUrl = 'https://medisupply-gw-5k2l9pfv.uc.gateway.dev/v1/auth/register';

  constructor(private http: HttpClient) { }

  registrarVendedor(vendedor: VendedorRequest, country: string): Observable<VendedorResponse> {
    const headers = new HttpHeaders({
      'X-Country': country,
      'Content-Type': 'application/json'
    });

    return this.http.post<VendedorResponse>(this.apiUrl, vendedor, { headers });
  }
}
