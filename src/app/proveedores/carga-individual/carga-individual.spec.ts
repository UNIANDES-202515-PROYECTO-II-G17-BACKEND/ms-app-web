import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CargaIndividual } from './carga-individual';

describe('CargaIndividual - Unit Tests', () => {
  let component: CargaIndividual;
  let mockProductoService: jasmine.SpyObj<any>;
  let mockRouter: jasmine.SpyObj<any>;
  let mockDialog: jasmine.SpyObj<any>;
  let mockDialogRef: jasmine.SpyObj<any>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;

  const mockProveedores = [
    {
      id: '1',
      nombre: 'Proveedor 1',
      tipo_de_persona: 'JURIDICA',
      documento: '12345678',
      tipo_documento: 'NIT',
      pais: 'co',
      direccion: 'Calle 123',
      telefono: '1234567890',
      email: 'prov1@test.com',
      pagina_web: 'http://prov1.com',
      activo: true
    },
    {
      id: '2',
      nombre: 'Proveedor 2',
      tipo_de_persona: 'JURIDICA',
      documento: '87654321',
      tipo_documento: 'NIT',
      pais: 'co',
      direccion: 'Calle 456',
      telefono: '0987654321',
      email: 'prov2@test.com',
      pagina_web: 'http://prov2.com',
      activo: true
    }
  ];

  beforeEach(() => {
    // Crear mocks
    mockProductoService = jasmine.createSpyObj('CargaIndividualService', [
      'listarProveedores',
      'crearProducto',
      'asociarProductoProveedor'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockCdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    mockDialog.open.and.returnValue(mockDialogRef);
    mockDialogRef.afterClosed.and.returnValue(of(true));
    mockProductoService.listarProveedores.and.returnValue(of(mockProveedores));

    // Crear instancia del componente directamente
    component = new CargaIndividual(
      new FormBuilder(),
      mockProductoService,
      mockRouter,
      mockDialog,
      mockCdr
    );

    // Llamar ngOnInit manualmente
    component.ngOnInit();
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
    expect(component.productoForm).toBeDefined();
  });

  it('should initialize form with default values', () => {
    expect(component.productoForm.get('sku')?.value).toBe('');
    expect(component.productoForm.get('nombre')?.value).toBe('');
    expect(component.productoForm.get('categoria')?.value).toBe('');
    expect(component.productoForm.get('moneda')?.value).toBe('COP');
    expect(component.productoForm.get('pais')?.value).toBe('co');
    expect(component.productoForm.get('controlado')?.value).toBe(false);
    expect(component.productoForm.get('activo')?.value).toBe(true);
  });

  it('should validate required fields', () => {
    const form = component.productoForm;
    expect(form.valid).toBeFalse();

    expect(form.get('sku')?.hasError('required')).toBeTrue();
    expect(form.get('nombre')?.hasError('required')).toBeTrue();
    expect(form.get('categoria')?.hasError('required')).toBeTrue();
    expect(form.get('temp_min')?.hasError('required')).toBeTrue();
    expect(form.get('temp_max')?.hasError('required')).toBeTrue();
    expect(form.get('proveedor_id')?.hasError('required')).toBeTrue();
    expect(form.get('sku_proveedor')?.hasError('required')).toBeTrue();
    expect(form.get('precio')?.hasError('required')).toBeTrue();
  });

  it('should validate minimum length for nombre', () => {
    const nombreControl = component.productoForm.get('nombre');

    nombreControl?.setValue('AB');
    expect(nombreControl?.hasError('minlength')).toBeTrue();

    nombreControl?.setValue('Test Product');
    expect(nombreControl?.hasError('minlength')).toBeFalse();
  });

  it('should validate temperature pattern', () => {
    const tempMinControl = component.productoForm.get('temp_min');
    const tempMaxControl = component.productoForm.get('temp_max');

    tempMinControl?.setValue('abc');
    expect(tempMinControl?.hasError('pattern')).toBeTrue();

    tempMinControl?.setValue('25.5');
    expect(tempMinControl?.hasError('pattern')).toBeFalse();

    tempMinControl?.setValue('-10');
    expect(tempMinControl?.hasError('pattern')).toBeFalse();

    tempMaxControl?.setValue('30.5');
    expect(tempMaxControl?.hasError('pattern')).toBeFalse();
  });

  it('should validate precio minimum value', () => {
    const precioControl = component.productoForm.get('precio');

    precioControl?.setValue(-10);
    expect(precioControl?.hasError('min')).toBeTrue();

    precioControl?.setValue(0);
    expect(precioControl?.hasError('min')).toBeFalse();

    precioControl?.setValue(100);
    expect(precioControl?.hasError('min')).toBeFalse();
  });

  it('should validate lote_minimo minimum value', () => {
    const loteControl = component.productoForm.get('lote_minimo');

    loteControl?.setValue(0);
    expect(loteControl?.hasError('min')).toBeTrue();

    loteControl?.setValue(1);
    expect(loteControl?.hasError('min')).toBeFalse();
  });

  it('should load proveedores on init', (done) => {
    setTimeout(() => {
      expect(mockProductoService.listarProveedores).toHaveBeenCalledWith('co');
      expect(component.proveedores).toEqual(mockProveedores);
      done();
    }, 10);
  });

  it('should handle error when loading proveedores', (done) => {
    const mockError = {
      error: {
        detail: 'Error al cargar proveedores'
      }
    };

    mockProductoService.listarProveedores.and.returnValue(throwError(() => mockError));

    component.cargarProveedores();

    setTimeout(() => {
      expect(mockDialog.open).toHaveBeenCalled();
      expect(component.state.isLoading).toBeFalse();
      done();
    }, 10);
  });

  it('should reload proveedores when country changes', () => {
    component.productoForm.patchValue({ pais: 'mx' });
    component.onPaisChange();

    expect(mockProductoService.listarProveedores).toHaveBeenCalledWith('mx');
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    expect(mockProductoService.crearProducto).not.toHaveBeenCalled();
  });

  it('should submit valid form and create product successfully', (done) => {
    // Llenar formulario con datos válidos
    component.productoForm.patchValue({
      sku: 'SKU123',
      nombre: 'Test Product',
      categoria: 'MEDICAMENTO',
      temp_min: '2',
      temp_max: '8',
      controlado: true,
      proveedor_id: '1',
      sku_proveedor: 'PROV-SKU-123',
      precio: '100',
      moneda: 'COP',
      lead_time_dias: '5',
      lote_minimo: '10',
      pais: 'co',
      activo: true
    });

    const mockProductoResponse = {
      id: '123',
      sku: 'SKU123',
      nombre: 'Test Product',
      categoria: 'MEDICAMENTO',
      controlado: true
    };

    mockProductoService.crearProducto.and.returnValue(of(mockProductoResponse));
    mockProductoService.asociarProductoProveedor.and.returnValue(of({ success: true }));

    component.onSubmit();

    setTimeout(() => {
      expect(mockProductoService.crearProducto).toHaveBeenCalledWith(
        jasmine.objectContaining({
          sku: 'SKU123',
          nombre: 'Test Product',
          categoria: 'MEDICAMENTO',
          temp_min: 2,
          temp_max: 8,
          controlado: true
        }),
        'co'
      );

      expect(mockProductoService.asociarProductoProveedor).toHaveBeenCalledWith(
        '1',
        jasmine.objectContaining({
          producto_id: '123',
          sku_proveedor: 'PROV-SKU-123',
          precio: 100,
          moneda: 'COP',
          lead_time_dias: 5,
          lote_minimo: 10,
          activo: true
        }),
        'co'
      );

      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      done();
    }, 10);
  });

  it('should handle error during product creation', (done) => {
    component.productoForm.patchValue({
      sku: 'SKU123',
      nombre: 'Test Product',
      categoria: 'MEDICAMENTO',
      temp_min: '2',
      temp_max: '8',
      controlado: false,
      proveedor_id: '1',
      sku_proveedor: 'PROV-SKU-123',
      precio: '100',
      moneda: 'COP',
      lead_time_dias: '5',
      lote_minimo: '10',
      pais: 'co',
      activo: true
    });

    const mockError = {
      error: {
        detail: 'SKU already exists'
      }
    };

    mockProductoService.crearProducto.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    setTimeout(() => {
      expect(component.state.isLoading).toBeFalse();
      expect(component.state.error).toBe('SKU already exists');
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      done();
    }, 10);
  });

  it('should test loading state getter', () => {
    expect(component.isLoading).toBeFalse();

    component.state.isLoading = true;
    expect(component.isLoading).toBeTrue();
  });

  it('should navigate back to home on goBack', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should have correct categorias options', () => {
    expect(component.categorias).toEqual([
      { value: 'MEDICAMENTO', label: 'Medicamento' },
      { value: 'DISPOSITIVO_MEDICO', label: 'Dispositivo Médico' },
      { value: 'EQUIPO', label: 'Equipo' },
      { value: 'MATERIAL', label: 'Material' },
      { value: 'REACTIVO', label: 'Reactivo' }
    ]);
  });

  it('should have correct monedas options', () => {
    expect(component.monedas).toEqual([
      { value: 'COP', label: 'COP - Peso Colombiano' },
      { value: 'USD', label: 'USD - Dólar' },
      { value: 'EUR', label: 'EUR - Euro' }
    ]);
  });

  it('should have correct paises options', () => {
    expect(component.paises).toEqual([
      { value: 'co', label: 'Colombia' },
      { value: 'mx', label: 'México' },
      { value: 'pe', label: 'Perú' },
      { value: 'cl', label: 'Chile' },
      { value: 'ar', label: 'Argentina' }
    ]);
  });
});
