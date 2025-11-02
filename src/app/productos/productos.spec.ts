import { of, throwError } from 'rxjs';
import { Productos } from './productos';
import { ProductosService } from './productos.service';
import { Producto, UbicacionProducto } from './productos.interface';

describe('Productos - Unit Tests', () => {
  let component: Productos;
  let mockProductosService: jasmine.SpyObj<ProductosService>;

  const mockProductos: Producto[] = [
    { id: '1', sku: 'SKU001', nombre: 'Producto 1', categoria: 'Medicamento', controlado: true },
    { id: '2', sku: 'SKU002', nombre: 'Producto 2', categoria: 'Insumo', controlado: false }
  ];

  const mockUbicaciones: UbicacionProducto[] = [
    { ubicacion_id: 'U1', bodega_id: 'B1', ciudad: 'Bogotá', pasillo: 'A', estante: '1', posicion: '1', cantidad: 10 },
    { ubicacion_id: 'U2', bodega_id: 'B1', ciudad: 'Bogotá', pasillo: 'A', estante: '1', posicion: '2', cantidad: 5 }
  ];

  beforeEach(() => {
    mockProductosService = jasmine.createSpyObj('ProductosService', [
      'obtenerProductos',
      'obtenerUbicacionesProducto'
    ]);

    mockProductosService.obtenerProductos.and.returnValue(of(mockProductos));

    component = new Productos(mockProductosService);
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar con valores por defecto', () => {
    expect(component.productos()).toEqual([]);
    expect(component.productoSeleccionado()).toBeNull();
    expect(component.ubicaciones()).toEqual([]);
    expect(component.cargandoProductos()).toBe(false);
    expect(component.cargandoUbicaciones()).toBe(false);
    expect(component.errorProductos()).toBeNull();
    expect(component.errorUbicaciones()).toBeNull();
  });

  it('debe cargar productos al inicializar', (done) => {
    component.ngOnInit();

    setTimeout(() => {
      expect(mockProductosService.obtenerProductos).toHaveBeenCalled();
      expect(component.productos().length).toBe(2);
      expect(component.cargandoProductos()).toBe(false);
      expect(component.errorProductos()).toBeNull();
      done();
    }, 10);
  });

  it('debe manejar error al cargar productos', (done) => {
    mockProductosService.obtenerProductos.and.returnValue(throwError(() => new Error('Error')));

    component.cargarProductos();

    setTimeout(() => {
      expect(component.cargandoProductos()).toBe(false);
      expect(component.errorProductos()).toBe('Error al cargar productos');
      done();
    }, 10);
  });

  it('debe cargar ubicaciones de un producto', (done) => {
    mockProductosService.obtenerUbicacionesProducto.and.returnValue(of(mockUbicaciones));

    component.verUbicaciones(mockProductos[0]);

    setTimeout(() => {
      expect(component.productoSeleccionado()).toEqual(mockProductos[0]);
      expect(component.ubicaciones().length).toBe(2);
      expect(component.cargandoUbicaciones()).toBe(false);
      expect(component.errorUbicaciones()).toBeNull();
      done();
    }, 10);
  });

  it('debe manejar error al cargar ubicaciones', (done) => {
    mockProductosService.obtenerUbicacionesProducto.and.returnValue(throwError(() => new Error('Error')));

    component.verUbicaciones(mockProductos[0]);

    setTimeout(() => {
      expect(component.errorUbicaciones()).toBe('Error al cargar ubicaciones');
      expect(component.cargandoUbicaciones()).toBe(false);
      done();
    }, 10);
  });

  it('debe cerrar detalle de producto', () => {
    component.productoSeleccionado.set(mockProductos[0]);
    component.ubicaciones.set(mockUbicaciones);
    component.errorUbicaciones.set('Error test');

    component.cerrarDetalle();

    expect(component.productoSeleccionado()).toBeNull();
    expect(component.ubicaciones().length).toBe(0);
    expect(component.errorUbicaciones()).toBeNull();
  });

  it('debe calcular total de cantidad correctamente', () => {
    component.ubicaciones.set(mockUbicaciones);

    const total = component.getTotalCantidad();

    expect(total).toBe(15);
  });

  it('debe retornar 0 cuando no hay ubicaciones', () => {
    component.ubicaciones.set([]);

    const total = component.getTotalCantidad();

    expect(total).toBe(0);
  });

  it('debe tener las columnas correctas para productos', () => {
    expect(component.columnasProductos).toEqual(['sku', 'nombre', 'categoria', 'controlado', 'acciones']);
  });

  it('debe tener las columnas correctas para ubicaciones', () => {
    expect(component.columnasUbicaciones).toEqual(['ciudad', 'pasillo', 'estante', 'posicion', 'cantidad']);
  });
});
