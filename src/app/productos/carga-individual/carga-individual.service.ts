import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoRequest, ProductoResponse } from './carga-individual.interface';

@Injectable({
  providedIn: 'root'
})
export class CargaIndividualService {
  private apiUrl = 'https://medisupply-gw-5k2l9pfv.uc.gateway.dev/v1/productos';

  constructor(private http: HttpClient) { }

  registrarProducto(producto: ProductoRequest, country: string): Observable<ProductoResponse> {
    const headers = new HttpHeaders({
      'X-Country': country,
      'Content-Type': 'application/json'
    });

    return this.http.post<ProductoResponse>(this.apiUrl, producto, { headers });
  }
}
