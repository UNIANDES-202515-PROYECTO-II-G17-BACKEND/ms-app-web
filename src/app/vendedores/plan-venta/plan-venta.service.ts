import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vendedor, Producto, ClienteInstitucional, PlanVentaRequest, PlanVentaResponse } from './plan-venta.interface';

@Injectable({
  providedIn: 'root'
})
export class PlanVentaService {
  private apiUrl = 'https://medisupply-gw-5k2l9pfv.uc.gateway.dev/v1';

  constructor(private http: HttpClient) { }

  obtenerVendedores(country: string): Observable<Vendedor[]> {
    const headers = new HttpHeaders({
      'X-Country': country
    });

    return this.http.get<Vendedor[]>(`${this.apiUrl}/usuarios?role=seller&limit=100&offset=0`, { headers });
  }

  obtenerProductos(country: string): Observable<Producto[]> {
    const headers = new HttpHeaders({
      'X-Country': country
    });

    return this.http.get<Producto[]>(`${this.apiUrl}/inventario/productos/todos?limit=100&offset=0`, { headers });
  }

  obtenerClientesInstitucionales(country: string): Observable<ClienteInstitucional[]> {
    const headers = new HttpHeaders({
      'X-Country': country
    });

    return this.http.get<ClienteInstitucional[]>(`${this.apiUrl}/usuarios?role=institutional_customer&limit=100&offset=0`, { headers });
  }

  crearPlanVenta(plan: PlanVentaRequest, country: string): Observable<PlanVentaResponse> {
    const headers = new HttpHeaders({
      'X-Country': country,
      'Content-Type': 'application/json'
    });

    return this.http.post<PlanVentaResponse>(`${this.apiUrl}/ventas/planes`, plan, { headers });
  }
}
