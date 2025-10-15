import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroRequest, RegistroResponse } from './registro.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  constructor(private http: HttpClient) { }

  registro(data: RegistroRequest): Observable<RegistroResponse> {

    return this.http.post<RegistroResponse>(`${environment.apiUrl}/auth/register`, data, {
      headers: {
        'X-Country': 'mx',
        'Content-Type': 'application/json'
      }
    });
  }
}
