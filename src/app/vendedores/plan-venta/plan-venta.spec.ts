import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { PlanVenta } from './plan-venta';

describe('PlanVenta - Unit Tests', () => {
  let component: PlanVenta;
  let mockPlanVentaService: jasmine.SpyObj<any>;
  let mockRouter: jasmine.SpyObj<any>;
  let mockDialog: jasmine.SpyObj<any>;
  let mockDialogRef: jasmine.SpyObj<any>;

  const mockVendedores = [
    {
      id: 1,
      username: 'vendedor1',
      role: 'vendedor',
      institution_name: 'Test',
      full_name: 'Vendedor Test',
      document_type: 'CC',
      document_number: '123456',
      email: 'vendedor@test.com',
      telephone: '123456789',
      address: null,
      city: null,
      created_at: '2024-01-01',
      updated_at: null
    }
  ];

  const mockProductos = [
    { id: '1', sku: 'SKU001', nombre: 'Producto 1', categoria: 'Medicamento', controlado: false },
    { id: '2', sku: 'SKU002', nombre: 'Producto 2', categoria: 'Insumo', controlado: true }
  ];

  const mockClientes = [
    {
      id: 1,
      username: 'cliente1',
      role: 'cliente',
      institution_name: 'Hospital Test',
      full_name: 'Cliente Test',
      document_type: 'NIT',
      document_number: '900123456',
      email: 'cliente@test.com',
      telephone: '987654321',
      address: 'Calle 123',
      city: 'Bogotá',
      created_at: '2024-01-01',
      updated_at: null
    }
  ];

  beforeEach(() => {
    mockPlanVentaService = jasmine.createSpyObj('PlanVentaService', [
      'obtenerVendedores',
      'obtenerProductos',
      'obtenerClientesInstitucionales',
      'crearPlanVenta'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockDialog.open.and.returnValue(mockDialogRef);
    mockDialogRef.afterClosed.and.returnValue(of(true));
    mockPlanVentaService.obtenerVendedores.and.returnValue(of(mockVendedores));
    mockPlanVentaService.obtenerProductos.and.returnValue(of(mockProductos));
    mockPlanVentaService.obtenerClientesInstitucionales.and.returnValue(of(mockClientes));

    component = new PlanVenta(
      new FormBuilder(),
      mockPlanVentaService,
      mockRouter,
      mockDialog
    );

    component.ngOnInit();
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
    expect(component.planForm).toBeDefined();
  });

  it('debe inicializar formulario con valores vacíos', () => {
    expect(component.planForm.get('id_vendedor')?.value).toBe('');
    expect(component.planForm.get('periodo')?.value).toBe('');
    expect(component.planForm.get('territorio')?.value).toBe('');
    expect(component.planForm.get('ids_productos')?.value).toEqual([]);
  });

  it('debe validar campos requeridos', () => {
    const form = component.planForm;
    expect(form.valid).toBeFalse();

    expect(form.get('id_vendedor')?.hasError('required')).toBeTrue();
    expect(form.get('periodo')?.hasError('required')).toBeTrue();
    expect(form.get('territorio')?.hasError('required')).toBeTrue();
    expect(form.get('meta_monto')?.hasError('required')).toBeTrue();
    expect(form.get('meta_unidades')?.hasError('required')).toBeTrue();
    expect(form.get('meta_clientes')?.hasError('required')).toBeTrue();
    expect(form.get('fecha_inicio')?.hasError('required')).toBeTrue();
    expect(form.get('fecha_fin')?.hasError('required')).toBeTrue();
  });

  it('debe validar longitud mínima de territorio', () => {
    const territorioControl = component.planForm.get('territorio');

    territorioControl?.setValue('AB');
    expect(territorioControl?.hasError('minlength')).toBeTrue();

    territorioControl?.setValue('Bogotá');
    expect(territorioControl?.hasError('minlength')).toBeFalse();
  });

  it('debe validar valores mínimos', () => {
    const metaMontoControl = component.planForm.get('meta_monto');
    const metaUnidadesControl = component.planForm.get('meta_unidades');
    const metaClientesControl = component.planForm.get('meta_clientes');

    metaMontoControl?.setValue(-10);
    expect(metaMontoControl?.hasError('min')).toBeTrue();

    metaUnidadesControl?.setValue(0);
    expect(metaUnidadesControl?.hasError('min')).toBeTrue();

    metaClientesControl?.setValue(0);
    expect(metaClientesControl?.hasError('min')).toBeTrue();
  });

  it('debe validar al menos un producto seleccionado', () => {
    const idsProductosControl = component.planForm.get('ids_productos');

    idsProductosControl?.setValue([]);
    expect(idsProductosControl?.hasError('atLeastOne')).toBeTrue();

    idsProductosControl?.setValue(['1']);
    expect(idsProductosControl?.hasError('atLeastOne')).toBeFalse();
  });

  it('debe cargar vendedores al inicializar', (done) => {
    setTimeout(() => {
      expect(mockPlanVentaService.obtenerVendedores).toHaveBeenCalledWith('co');
      expect(component.vendedores.length).toBe(1);
      expect(component.state.loadingVendedores).toBeFalse();
      done();
    }, 10);
  });

  it('debe cargar productos al inicializar', (done) => {
    setTimeout(() => {
      expect(mockPlanVentaService.obtenerProductos).toHaveBeenCalledWith('co');
      expect(component.productos.length).toBe(2);
      expect(component.state.loadingProductos).toBeFalse();
      done();
    }, 10);
  });

  it('debe cargar clientes al inicializar', (done) => {
    setTimeout(() => {
      expect(mockPlanVentaService.obtenerClientesInstitucionales).toHaveBeenCalledWith('co');
      expect(component.clientes.length).toBe(1);
      expect(component.state.loadingClientes).toBeFalse();
      done();
    }, 10);
  });

  it('debe manejar error al cargar vendedores', (done) => {
    mockPlanVentaService.obtenerVendedores.and.returnValue(throwError(() => new Error('Error')));

    component.cargarVendedores();

    setTimeout(() => {
      expect(component.state.loadingVendedores).toBeFalse();
      expect(component.state.error).toBe('Error al cargar los vendedores');
      done();
    }, 10);
  });

  it('debe manejar error al cargar productos', (done) => {
    mockPlanVentaService.obtenerProductos.and.returnValue(throwError(() => new Error('Error')));

    component.cargarProductos();

    setTimeout(() => {
      expect(component.state.loadingProductos).toBeFalse();
      expect(component.state.error).toBe('Error al cargar los productos');
      done();
    }, 10);
  });

  it('debe manejar error al cargar clientes', (done) => {
    mockPlanVentaService.obtenerClientesInstitucionales.and.returnValue(throwError(() => new Error('Error')));

    component.cargarClientes();

    setTimeout(() => {
      expect(component.state.loadingClientes).toBeFalse();
      expect(component.state.error).toBe('Error al cargar los clientes institucionales');
      done();
    }, 10);
  });

  it('debe obtener nombre de producto por id', () => {
    component.productos = mockProductos;

    const nombre = component.obtenerNombreProducto('1');
    expect(nombre).toBe('Producto 1');

    const nombreNoExiste = component.obtenerNombreProducto('999');
    expect(nombreNoExiste).toBe('');
  });

  it('no debe enviar si el formulario es inválido', () => {
    component.onSubmit();

    expect(mockPlanVentaService.crearPlanVenta).not.toHaveBeenCalled();
  });

  it('debe validar que fecha fin sea posterior a fecha inicio', () => {
    component.planForm.patchValue({
      id_vendedor: '1',
      periodo: 'mensual',
      territorio: 'Bogotá',
      meta_monto: 1000,
      meta_unidades: 10,
      meta_clientes: 5,
      fecha_inicio: new Date('2024-02-01'),
      fecha_fin: new Date('2024-01-01'),
      ids_productos: ['1'],
      id_cliente_objetivo: '1'
    });

    component.onSubmit();

    expect(component.state.error).toBe('La fecha de fin debe ser posterior a la fecha de inicio');
    expect(component.state.isLoading).toBeFalse();
  });

  it('debe crear plan de venta exitosamente', (done) => {
    component.planForm.patchValue({
      id_vendedor: '1',
      periodo: 'mensual',
      territorio: 'Bogotá',
      meta_monto: '1000',
      meta_unidades: '10',
      meta_clientes: '5',
      fecha_inicio: new Date('2024-01-01'),
      fecha_fin: new Date('2024-01-31'),
      ids_productos: ['1', '2'],
      id_cliente_objetivo: '1'
    });

    const mockResponse = { message: 'Plan creado exitosamente', id: '123' };
    mockPlanVentaService.crearPlanVenta.and.returnValue(of(mockResponse));

    component.onSubmit();

    setTimeout(() => {
      expect(mockPlanVentaService.crearPlanVenta).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id_vendedor: '1',
          periodo: 'mensual',
          territorio: 'Bogotá',
          meta_monto: 1000,
          meta_unidades: 10,
          meta_clientes: 5,
          ids_productos: ['1', '2'],
          id_cliente_objetivo: '1'
        }),
        'co'
      );
      expect(component.state.isLoading).toBeFalse();
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      done();
    }, 10);
  });

  it('debe manejar error al crear plan de venta', (done) => {
    component.planForm.patchValue({
      id_vendedor: '1',
      periodo: 'mensual',
      territorio: 'Bogotá',
      meta_monto: '1000',
      meta_unidades: '10',
      meta_clientes: '5',
      fecha_inicio: new Date('2024-01-01'),
      fecha_fin: new Date('2024-01-31'),
      ids_productos: ['1'],
      id_cliente_objetivo: '1'
    });

    const mockError = { error: { detail: 'Error al crear plan' } };
    mockPlanVentaService.crearPlanVenta.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    setTimeout(() => {
      expect(component.state.isLoading).toBeFalse();
      expect(component.state.error).toBe('Error al crear plan');
      expect(mockDialog.open).toHaveBeenCalled();
      const dialogData = mockDialog.open.calls.mostRecent().args[1].data;
      expect(dialogData.type).toBe('error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      done();
    }, 10);
  });

  it('debe navegar hacia atrás al home', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('debe tener los periodos correctos', () => {
    expect(component.periodos.length).toBe(7);
    expect(component.periodos[0]).toEqual({ value: 'semanal', label: 'Semanal' });
    expect(component.periodos[6]).toEqual({ value: 'anual', label: 'Anual' });
  });

  it('debe inicializar estado correctamente', () => {
    expect(component.state.isLoading).toBeFalse();
    expect(component.state.loadingVendedores).toBeFalse();
    expect(component.state.loadingProductos).toBeFalse();
    expect(component.state.loadingClientes).toBeFalse();
    expect(component.state.error).toBeNull();
  });

  it('debe inicializar arrays vacíos', () => {
    const newComponent = new PlanVenta(
      new FormBuilder(),
      mockPlanVentaService,
      mockRouter,
      mockDialog
    );

    expect(newComponent.vendedores).toEqual([]);
    expect(newComponent.productos).toEqual([]);
    expect(newComponent.clientes).toEqual([]);
  });
});
