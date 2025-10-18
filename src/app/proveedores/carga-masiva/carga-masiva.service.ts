import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CargaMasivaResponse } from './carga-masiva.interface';

@Injectable({
  providedIn: 'root'
})
export class CargaMasivaService {
  private apiUrl = 'https://medisupply-gw-5k2l9pfv.uc.gateway.dev/v1/productos/bulk';

  constructor(private http: HttpClient) { }

  cargarProductosMasivos(file: File, country: string): Observable<CargaMasivaResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'X-Country': country
    });

    return this.http.post<CargaMasivaResponse>(this.apiUrl, formData, { headers });
  }
}
