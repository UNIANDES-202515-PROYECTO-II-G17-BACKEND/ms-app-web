import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido, GenerarRutaResponse } from './generar-ruta.interface';

@Injectable({
  providedIn: 'root'
})
export class GenerarRutaService {
  private baseUrl = 'https://medisupply-gw-5k2l9pfv.uc.gateway.dev/v1';

  constructor(private http: HttpClient) { }

  obtenerPedidos(country: string = 'co'): Observable<Pedido[]> {
    const headers = new HttpHeaders({
      'X-Country': country
    });

    const params = {
      tipo: 'VENTA',
      estado: '',
      limit: '50',
      offset: '0'
    };

    return this.http.get<Pedido[]>(`${this.baseUrl}/pedidos`, { headers, params });
  }

  generarRuta(fecha: string, country: string = 'co'): Observable<GenerarRutaResponse> {
    const headers = new HttpHeaders({
      'X-Country': country,
      'Content-Type': 'application/json'
    });

    const params = {
      fecha: fecha,
      tipo: 'VENTA'
    };

    return this.http.post<GenerarRutaResponse>(`${this.baseUrl}/logistica/rutas/generar`, {}, { headers, params });
  }
}
