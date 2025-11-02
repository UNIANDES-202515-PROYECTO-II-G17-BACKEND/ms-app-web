import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CargaMasivaResponse, Proveedor } from './carga-masiva.interface';

@Injectable({
  providedIn: 'root'
})
export class CargaMasivaService {
  private apiUrl = 'https://medisupply-gw-5k2l9pfv.uc.gateway.dev/v1';

  constructor(private http: HttpClient) { }

  obtenerProveedores(country: string): Observable<Proveedor[]> {
    const headers = new HttpHeaders({
      'X-Country': country
    });

    return this.http.get<Proveedor[]>(`${this.apiUrl}/proveedores`, { headers });
  }

  cargarProductosMasivos(file: File, country: string, proveedorId: string): Observable<CargaMasivaResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'X-Country': country,
      'proveedor_id': proveedorId
    });

    return this.http.post<CargaMasivaResponse>(
      `${this.apiUrl}/inventario/productos/upload-csv`,
      formData,
      { headers }
    );
  }
}
