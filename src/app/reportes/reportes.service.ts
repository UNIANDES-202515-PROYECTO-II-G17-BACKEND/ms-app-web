import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Vendedor, Visita, PlanVenta, Usuario, Producto, PlanVentaCompleto } from './reportes.interface';

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

  getPlanesVenta(pais: string): Observable<PlanVenta[]> {
    const headers = new HttpHeaders({
      'X-Country': pais
    });

    return this.http.get<PlanVenta[]>(`${this.baseUrl}/ventas/planes`, { headers });
  }

  getUsuario(pais: string, id: string): Observable<Usuario> {
    const headers = new HttpHeaders({
      'X-Country': pais
    });

    return this.http.get<Usuario>(`${this.baseUrl}/usuarios/usuario/${id}`, { headers });
  }

  getProducto(pais: string, id: string): Observable<Producto> {
    const headers = new HttpHeaders({
      'X-Country': pais
    });

    return this.http.get<Producto>(`${this.baseUrl}/inventario/producto/${id}/detalle`, { headers });
  }

  getPlanesVentaCompletos(pais: string): Observable<PlanVentaCompleto[]> {
    return this.getPlanesVenta(pais).pipe(
      switchMap(planes => {
        // Si no hay planes, devolver array vacío inmediatamente
        if (!planes || planes.length === 0) {
          return of([]);
        }

        const requests = planes.map(plan => {
          const vendedorRequest = this.getUsuario(pais, plan.id_vendedor);
          const clienteRequest = this.getUsuario(pais, plan.id_cliente_objetivo);
          const productosRequests = plan.ids_productos.map(id => this.getProducto(pais, id));

          return forkJoin([
            vendedorRequest,
            clienteRequest,
            forkJoin(productosRequests)
          ]).pipe(
            map(([vendedor, cliente, productos]) => ({
              ...plan,
              vendedor_nombre: vendedor.full_name,
              cliente_objetivo_nombre: cliente.full_name,
              productos_nombres: productos.map(p => p.nombre),
              productos_count: productos.length
            }))
          );
        });

        return forkJoin(requests);
      })
    );
  }
}
