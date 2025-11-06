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
   * @param country - País para consultar (co, mx, pe, ec)
   * @param limit - Cantidad de productos a retornar
   * @param offset - Desplazamiento para paginación
   */
  obtenerProductos(country: string = 'co', limit: number = 100, offset: number = 0): Observable<Producto[]> {
    const headers = new HttpHeaders({
      'X-Country': country
    });

    return this.http.get<Producto[]>(
      `${this.baseUrl}/productos/todos?limit=${limit}&offset=${offset}`,
      { headers }
    );
  }

  /**
   * Obtener las ubicaciones de un producto específico
   * @param productoId - ID del producto
   * @param country - País para consultar (co, mx, pe, ec)
   */
  obtenerUbicacionesProducto(productoId: string, country: string = 'co'): Observable<UbicacionProducto[]> {
    const headers = new HttpHeaders({
      'X-Country': country
    });

    return this.http.get<UbicacionProducto[]>(
      `${this.baseUrl}/producto/${productoId}/ubicaciones`,
      { headers }
    );
  }
}

