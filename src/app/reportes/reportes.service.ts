import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vendedor, Visita } from './reportes.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private baseUrl = 'https://medisupply-gw-5k2l9pfv.uc.gateway.dev/v1';

  constructor(private http: HttpClient) {}

  getVendedores(pais: string): Observable<Vendedor[]> {
    const headers = new HttpHeaders({
      'X-Country': pais
    });

    return this.http.get<Vendedor[]>(`${this.baseUrl}/usuarios`, {
      headers,
      params: {
        role: 'seller',
        limit: '100',
        offset: '0'
      }
    });
  }

  getVisitas(pais: string, idVendedor: number, fecha: string): Observable<Visita[]> {
    const headers = new HttpHeaders({
      'X-Country': pais
    });

    return this.http.get<Visita[]>(`${this.baseUrl}/visitas`, {
      headers,
      params: {
        id_vendedor: idVendedor.toString(),
        d: fecha
      }
    });
  }
}
