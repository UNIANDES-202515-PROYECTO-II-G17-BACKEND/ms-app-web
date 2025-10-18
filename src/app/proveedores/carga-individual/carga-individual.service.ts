import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor, ProductoRequest, ProductoResponse, ProductoProveedorRequest, ProductoProveedorResponse } from './carga-individual.interface';

@Injectable({
  providedIn: 'root'
})
export class CargaIndividualService {
  private baseUrl = 'https://medisupply-gw-5k2l9pfv.uc.gateway.dev/v1';

  constructor(private http: HttpClient) { }

  // Paso 1: Listar proveedores
  listarProveedores(country: string): Observable<Proveedor[]> {
    const headers = new HttpHeaders({
      'X-Country': country
    });

    return this.http.get<Proveedor[]>(`${this.baseUrl}/proveedores`, { headers });
  }

  // Paso 2: Crear producto
  crearProducto(producto: ProductoRequest, country: string): Observable<ProductoResponse> {
    const headers = new HttpHeaders({
      'X-Country': country,
      'Content-Type': 'application/json'
    });

    return this.http.post<ProductoResponse>(`${this.baseUrl}/inventario/producto`, producto, { headers });
  }

  // Paso 3: Asociar producto con proveedor
  asociarProductoProveedor(proveedorId: string, productoProveedor: ProductoProveedorRequest, country: string): Observable<ProductoProveedorResponse> {
    const headers = new HttpHeaders({
      'X-Country': country,
      'Content-Type': 'application/json'
    });

    return this.http.post<ProductoProveedorResponse>(
      `${this.baseUrl}/proveedores/${proveedorId}/productos`,
      productoProveedor,
      { headers }
    );
  }
}
