import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProductosService } from './productos.service';
import { Producto, UbicacionProducto } from './productos.interface';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {
  productos = signal<Producto[]>([]);
  productoSeleccionado = signal<Producto | null>(null);
  ubicaciones = signal<UbicacionProducto[]>([]);
  cargandoProductos = signal(false);
  cargandoUbicaciones = signal(false);
  errorProductos = signal<string | null>(null);
  errorUbicaciones = signal<string | null>(null);
  paisSeleccionado = signal('co');

  columnasProductos: string[] = ['sku', 'nombre', 'categoria', 'controlado', 'acciones'];
  columnasUbicaciones: string[] = ['ciudad', 'pasillo', 'estante', 'posicion', 'cantidad'];

  paises = [
    { codigo: 'co', nombre: 'Colombia' },
    { codigo: 'mx', nombre: 'México' },
    { codigo: 'pe', nombre: 'Perú' },
    { codigo: 'ec', nombre: 'Ecuador' }
  ];

  constructor(private productosService: ProductosService) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargandoProductos.set(true);
    this.errorProductos.set(null);
    this.cerrarDetalle(); // Cerrar detalle al cambiar país

    this.productosService.obtenerProductos(this.paisSeleccionado()).subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.cargandoProductos.set(false);
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorProductos.set('Error al cargar productos');
        this.cargandoProductos.set(false);
      }
    });
  }

  onPaisChange(pais: string): void {
    this.paisSeleccionado.set(pais);
    this.cargarProductos();
  }

  verUbicaciones(producto: Producto): void {
    this.productoSeleccionado.set(producto);
    this.cargandoUbicaciones.set(true);
    this.errorUbicaciones.set(null);
    this.ubicaciones.set([]);

    this.productosService.obtenerUbicacionesProducto(producto.id, this.paisSeleccionado()).subscribe({
      next: (ubicaciones) => {
        this.ubicaciones.set(ubicaciones);
        this.cargandoUbicaciones.set(false);
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorUbicaciones.set('Error al cargar ubicaciones');
        this.cargandoUbicaciones.set(false);
      }
    });
  }

  cerrarDetalle(): void {
    this.productoSeleccionado.set(null);
    this.ubicaciones.set([]);
    this.errorUbicaciones.set(null);
  }

  getTotalCantidad(): number {
    return this.ubicaciones().reduce((total, u) => total + u.cantidad, 0);
  }
}

