import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, UbicacionProducto } from './productos.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private baseUrl = 'https://medisupply-gw-5k2l9pfv.uc.gateway.dev/v1/inventario';

  constructor(private http: HttpClient) { }

  /**
   * Obtener todos los productos
   * @param limit - Cantidad de productos a retornar
   * @param offset - Desplazamiento para paginación
   */
  obtenerProductos(limit: number = 100, offset: number = 0): Observable<Producto[]> {
    const headers = new HttpHeaders({
      'X-Country': 'co'
    });

    return this.http.get<Producto[]>(
      `${this.baseUrl}/productos/todos?limit=${limit}&offset=${offset}`,
      { headers }
    );
  }

  /**
   * Obtener las ubicaciones de un producto específico
   * @param productoId - ID del producto
   */
  obtenerUbicacionesProducto(productoId: string): Observable<UbicacionProducto[]> {
    const headers = new HttpHeaders({
      'X-Country': 'co'
    });

    return this.http.get<UbicacionProducto[]>(
      `${this.baseUrl}/producto/${productoId}/ubicaciones`,
      { headers }
    );
  }
}

